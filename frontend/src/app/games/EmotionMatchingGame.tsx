import StandardChoiceGame from "../components/StandardChoiceGame";
const questions=[
 {title:"Happy",prompt:"How does this situation feel? I got my favourite toy.",visual:"😊",answer:"Happy",options:["Happy","Sad","Angry","Scared"]},
 {title:"Sad",prompt:"How does this situation feel? My balloon popped.",visual:"😢",answer:"Sad",options:["Happy","Sad","Angry","Scared"]},
 {title:"Angry",prompt:"How does this situation feel? Someone took my turn.",visual:"😡",answer:"Angry",options:["Happy","Sad","Angry","Scared"]},
 {title:"Scared",prompt:"How does this situation feel? I hear a very loud sound.",visual:"😨",answer:"Scared",options:["Happy","Sad","Angry","Scared"]},
];
export default function EmotionMatchingGame(){return <StandardChoiceGame title="Emotion Matching" icon="😊" badge="FACP-ALIGNED • SOCIAL / COMMUNICATION" activityName="Emotion Matching" moduleId="facp-emotions" domain="Communication" gameType="emotion-matching" questions={questions} visualMode="large" helpText="Think about how the person might feel in this situation."/>}
