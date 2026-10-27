"""LearnAble Bayesian Knowledge Tracing service.

This service intentionally does not use Random Forest.  LearnAble has sparse,
learner-specific observations, so a probabilistic knowledge-tracing model is a
better fit than a high-capacity supervised classifier that needs many labelled
next-activity transitions.

BKT estimates the probability that a learner has mastered a skill/domain.  The
prediction endpoint then ranks available activities using that estimated
mastery, the learner's current ALPI/readiness and the FACP domain evidence.
"""
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Any, Dict, List

app = FastAPI(title="LearnAble Bayesian Knowledge Tracing Service")

# Standard, interpretable BKT parameters.  These are project defaults, not
# official FACP parameters.  They are deliberately conservative for sparse data.
P_LEARN_INIT = 0.20
P_TRANSITION = 0.10
P_GUESS = 0.20
P_SLIP = 0.10

LEVELS = {"Beginner": 0, "Intermediate": 1, "Advanced": 2}


class PredictRequest(BaseModel):
    studentId: str
    features: Dict[str, Any] = Field(default_factory=dict)
    observations: List[Dict[str, Any]] = Field(default_factory=list)
    candidates: List[Dict[str, Any]] = Field(default_factory=list)


def num(value, fallback=0.0):
    try:
        return float(value if value is not None else fallback)
    except (TypeError, ValueError):
        return float(fallback)


def clamp(value, lo=0.0, hi=1.0):
    return max(lo, min(hi, value))


def bkt_update(p_mastery: float, correct: bool) -> float:
    """One standard BKT observation update followed by learning transition."""
    p_mastery = clamp(p_mastery)
    if correct:
        p_correct = p_mastery * (1 - P_SLIP) + (1 - p_mastery) * P_GUESS
        posterior = (p_mastery * (1 - P_SLIP)) / max(p_correct, 1e-9)
    else:
        p_incorrect = p_mastery * P_SLIP + (1 - p_mastery) * (1 - P_GUESS)
        posterior = (p_mastery * P_SLIP) / max(p_incorrect, 1e-9)
    return clamp(posterior + (1 - posterior) * P_TRANSITION)




def normalize_functional_level(value: Any) -> str:
    aliases = {
        "pre-primary": "Preprimary", "preprimary": "Preprimary",
        "primary": "Primary-I", "primary-i": "Primary-I", "primary ii": "Primary-II", "primary-ii": "Primary-II",
        "secondary": "Secondary",
        "pre-vocational-1": "Prevocational-I", "pre-vocational-i": "Prevocational-I",
        "prevocational-1": "Prevocational-I", "prevocational-i": "Prevocational-I",
        "pre-vocational-2": "Prevocational-II", "pre-vocational-ii": "Prevocational-II",
        "prevocational-2": "Prevocational-II", "prevocational-ii": "Prevocational-II",
        "vocational": "Vocational", "care group": "Care Group", "caregroup": "Care Group",
    }
    raw = str(value or "").strip()
    return aliases.get(raw.lower(), raw)


def filter_facp_candidates(candidates: List[Dict[str, Any]], functional_level: str) -> List[Dict[str, Any]]:
    level = normalize_functional_level(functional_level)
    if not level:
        return [c for c in candidates if c.get("gameConfig") is None]
    return [
        c for c in candidates
        if c.get("gameConfig") is None
        and isinstance(c.get("facpLevels"), list)
        and level in c.get("facpLevels", [])
    ]

def evidence_prior(facp_score: float, alpi: float, readiness: float) -> float:
    """Prior mastery from available evidence; used only when observations are sparse."""
    # FACP is teacher-observed functional evidence, so it receives the largest
    # prior weight. ALPI is ongoing digital evidence. This is not an FACP formula.
    return clamp(0.50 * facp_score / 100.0 + 0.30 * alpi / 100.0 + 0.20 * readiness / 100.0)


def observation_correct(obs: Dict[str, Any]) -> bool:
    """Convert an activity observation to the binary BKT observation required by BKT.

    A completed activity is treated as correct when its accuracy is >= 80%.
    This mirrors the project's 80% adaptive threshold while keeping BKT binary.
    """
    accuracy = num(obs.get("accuracy"), num(obs.get("performanceIndex")))
    return accuracy >= 80.0


def status_prior(status: str) -> float:
    # FACP status is qualitative. These values are only Bayesian prior anchors
    # for the adaptive model and are NOT official FACP scores.
    return {
        "+": 0.95,
        "C": 0.85,
        "GP": 0.60,
        "VP": 0.50,
        "M": 0.40,
        "PP": 0.30,
        "-": 0.10,
        "NE": 0.20,
    }.get(str(status or ""), P_LEARN_INIT)


def mastery_by_skill(observations: List[Dict[str, Any]], features: Dict[str, Any]):
    facp_domains = features.get("facpDomainScores") or {}
    facp_item_priors = features.get("facpItemPriors") or {}
    base_alpi = num(features.get("alpi"))
    base_readiness = num(features.get("readiness"), base_alpi)
    base_facp = num(features.get("facpScore"))

    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for obs in observations:
        codes = obs.get("facpItemCodes") or []
        keys = [f"item:{str(c)}" for c in codes if str(c).strip()]
        if not keys:
            keys = [f"domain:{str(obs.get('domain') or 'General')}"]
        for key in keys:
            grouped.setdefault(key, []).append(obs)

    result = {}
    # Include FACP item priors even before the learner has digital observations.
    for code, prior_value in facp_item_priors.items():
        key = f"item:{code}"
        grouped.setdefault(key, [])
    for domain, facp_value in facp_domains.items():
        grouped.setdefault(f"domain:{domain}", [])

    for key, rows in grouped.items():
        if key.startswith("item:"):
            code = key.split(":", 1)[1]
            prior = num(facp_item_priors.get(code), P_LEARN_INIT)
        else:
            domain = key.split(":", 1)[1]
            prior = evidence_prior(num(facp_domains.get(domain), base_facp), base_alpi, base_readiness)
        p = clamp(prior)
        for obs in sorted(rows, key=lambda x: str(x.get("completedAt") or x.get("createdAt") or "")):
            p = bkt_update(p, observation_correct(obs))
        result[key] = round(p * 100.0, 1)
    return result


def mastery_by_domain(observations: List[Dict[str, Any]], features: Dict[str, Any]):
    """Aggregate item-level BKT states back to domains for UI/recommendation."""
    skill = mastery_by_skill(observations, features)
    grouped: Dict[str, List[float]] = {}
    for key, value in skill.items():
        if key.startswith("domain:"):
            domain = key.split(":", 1)[1]
            grouped.setdefault(domain, []).append(value)
        elif key.startswith("item:"):
            # Item-to-domain mapping is supplied by the Node service.
            code = key.split(":", 1)[1]
            domain = str((features.get("facpItemDomains") or {}).get(code) or "General")
            grouped.setdefault(domain, []).append(value)
    return {d: round(sum(v) / len(v), 1) for d, v in grouped.items() if v}


def difficulty_from_mastery(mastery: float) -> str:
    # Game difficulty is intentionally separate from the learner's learning level.
    # BKT level: Beginner/Intermediate/Advanced -> Game difficulty: Easy/Medium/Hard.
    if mastery >= 80:
        return "Hard"
    if mastery >= 60:
        return "Medium"
    return "Easy"


def level_from_mastery(mastery: float) -> str:
    if mastery >= 80:
        return "Advanced"
    if mastery >= 60:
        return "Intermediate"
    return "Beginner"


def candidate_score(candidate: Dict[str, Any], features: Dict[str, Any], mastery: Dict[str, float], skill_mastery: Dict[str, float]):
    domain = str(candidate.get("facpDomain") or candidate.get("category") or "General")
    item_codes = [str(x) for x in (candidate.get("facpItemCodes") or []) if str(x).strip()]
    item_values = [num(skill_mastery.get(f"item:{code}"), 0.0) for code in item_codes if f"item:{code}" in skill_mastery]
    m = min(item_values) if item_values else num(mastery.get(domain), 0.0)
    current_id = str(features.get("moduleId") or "")
    recent = {str(x) for x in (features.get("recentModuleIds") or [])}
    candidate_level = str(candidate.get("level") or "Beginner")
    target_level = level_from_mastery(m)
    learner_level = str(features.get("learningLevel") or "")

    score = 0.0
    # First priority: work on the least-mastered domain, while still avoiding
    # immediate repetition of the exact same activity.
    if domain == str(features.get("weakestFacpDomain") or ""):
        score += 45
    if domain == str(features.get("weakestActivityDomain") or ""):
        score += 20
    if str(candidate.get("moduleId") or "") != current_id:
        score += 18
    if str(candidate.get("moduleId") or "") not in recent:
        score += 10
    if candidate_level == target_level:
        score += 20
    # Learning level is a difficulty signal, not a curriculum boundary.
    if learner_level and candidate_level == learner_level:
        score += 15
    # If mastery is low, prefer easier guided content; if high, allow challenge.
    if m < 60 and candidate_level == "Beginner":
        score += 15
    elif 60 <= m < 80 and candidate_level == "Intermediate":
        score += 15
    elif m >= 80 and candidate_level == "Advanced":
        score += 15
    return score


@app.post("/predict")
def predict(req: PredictRequest):
    features = req.features or {}
    raw_candidates = req.candidates or []
    candidates = filter_facp_candidates(raw_candidates, str(features.get("facpFunctionalLevel") or ""))
    observations = req.observations or []
    skill_mastery = mastery_by_skill(observations, features)
    mastery = mastery_by_domain(observations, features)

    if mastery:
        weakest = min(mastery.items(), key=lambda x: x[1])
        target_mastery = float(weakest[1])
    else:
        target_mastery = num(features.get("readiness"), num(features.get("alpi")))
        weakest = (str(features.get("weakestFacpDomain") or features.get("weakestActivityDomain") or "General"), target_mastery)

    target_level = level_from_mastery(target_mastery)
    target_difficulty = difficulty_from_mastery(target_mastery)

    ranked = sorted(candidates, key=lambda c: candidate_score(c, features, mastery, skill_mastery), reverse=True)
    chosen = ranked[0] if ranked else None
    if chosen and str(chosen.get("moduleId")) == str(features.get("moduleId") or "") and len(ranked) > 1:
        chosen = ranked[1]

    alternatives = []
    seen = set()
    for c in ranked:
        mid = str(c.get("moduleId") or "")
        if chosen and mid == str(chosen.get("moduleId")):
            continue
        if mid in seen:
            continue
        seen.add(mid)
        alternatives.append(c)
        if len(alternatives) == 3:
            break

    confidence = clamp(target_mastery / 100.0)
    if observations:
        # With few observations, reduce confidence rather than pretending sparse
        # evidence is a highly certain prediction.
        confidence *= min(1.0, 0.55 + 0.15 * len(observations))

    reason = (
        f"Bayesian Knowledge Tracing estimates {weakest[0]} mastery at "
        f"{weakest[1]:.1f}%. The recommendation targets the learner's least-mastered "
        f"domain and selects a suitable difficulty."
    )
    if not observations:
        reason += " No digital observations exist yet, so FACP/ALPI evidence provides the prior."
    if raw_candidates and not candidates:
        reason += " No candidate module passed the student's FACP functional-level curriculum filter."

    return {
        "prediction": 1 if chosen else 0,
        "label": "Bayesian Knowledge-Tracing Recommendation" if chosen else "No Candidate Activity",
        "confidence": round(confidence, 3),
        "model": "BayesianKnowledgeTracing",
        "trainingSamples": len(observations),
        "featuresUsed": ["FACP domain evidence", "ALPI", "readiness", "activity accuracy", "activity domain", "recent activity history"],
        "masteryByDomain": mastery,
        "masteryBySkill": skill_mastery,
        "targetDomain": weakest[0],
        "estimatedMastery": round(target_mastery, 1),
        "recommendedDifficulty": target_difficulty,
        "recommendedLevel": target_level,
        "nextAction": "guided_repeat" if target_mastery < 60 else ("practice" if target_mastery < 80 else "increase_difficulty"),
        "reason": reason,
        "nextActivity": chosen,
        "alternatives": alternatives,
        "bktParameters": {
            "initialMastery": P_LEARN_INIT,
            "learningTransition": P_TRANSITION,
            "guess": P_GUESS,
            "slip": P_SLIP,
        },
        "sparseDataNote": "BKT updates a learner-specific mastery probability from each observation and does not require a large labelled transition dataset.",
    }


@app.get("/health")
def health():
    return {"status": "ok", "model": "BayesianKnowledgeTracing"}
