import StandardChoiceGame from "../components/StandardChoiceGame";
const questions=[
 {prompt:"What is this?",visual:"🌳",answer:"Tree",options:["Tree","Rock","Flower","River"]},
 {prompt:"What is this?",visual:"🐶",answer:"Dog",options:["Cat","Dog","Lion","Bird"]},
 {prompt:"What is this?",visual:"🍎",answer:"Apple",options:["Banana","Apple","Orange","Mango"]},
 {prompt:"What is this?",visual:"🚗",answer:"Car",options:["Bus","Train","Car","Bike"]},
 {prompt:"What is this?",visual:"🌸",answer:"Flower",options:["Tree","Flower","Cloud","Sun"]},
];
export default function PictureIdentificationGame(){return <StandardChoiceGame title="Picture Identification" icon="🖼️" badge="LEARNABLE • VISUAL IDENTIFICATION" activityName="Picture Identification" moduleId="game-picture-identification" domain="Academic" gameType="picture-identification" questions={questions} visualMode="large" helpText="Look carefully at the picture, then choose its name."/>}
