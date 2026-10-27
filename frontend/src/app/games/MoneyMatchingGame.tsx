import StandardChoiceGame from "../components/StandardChoiceGame";
const questions=[
 {prompt:"What is the value of this coin?",visual:"🪙",answer:"₹1",options:["₹1","₹2","₹5","₹10"]},
 {prompt:"What is the value of this coin?",visual:"🪙",answer:"₹2",options:["₹1","₹2","₹5","₹10"]},
 {prompt:"What is the value of this coin?",visual:"🪙",answer:"₹5",options:["₹1","₹2","₹5","₹10"]},
 {prompt:"What is the value of this note?",visual:"💵",answer:"₹10",options:["₹2","₹5","₹10","₹20"]},
];
export default function MoneyMatchingGame(){return <StandardChoiceGame title="Money Identification" icon="💰" badge="FACP-ALIGNED • ACADEMIC / FUNCTIONAL MONEY" activityName="Money Identification" moduleId="facp-money" domain="Academic / Cognitive Skills" gameType="money-identification" questions={questions} visualMode="large" helpText="Look at the money and choose its value."/>}
