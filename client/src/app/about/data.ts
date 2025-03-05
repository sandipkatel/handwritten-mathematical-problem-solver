import { info, shortDetail } from "@/types";

function shuffleArray<T>(array: Array<T>) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const shortPersonalDetail: shortDetail[] = [
  {
    name: "Sandip Katel",
    age: 23,
    imgUrl: "/media/team/sandip.png",
  },
  {
    name: "Saphal Rimal",
    age: 23,
    imgUrl: "/media/team/saphal.jpg",
  },
  {
    name: "Sharad Pokharel",
    age: 23,
    imgUrl: "/media/team/sharad.JPG",
  },
  {
    name: "Sijan Joshi",
    age: 23,
    imgUrl: "/media/team/sijan2.png",
  },
];

// shuffleArray(shortPersonalDetail);

const PersonalDetail: info[] = [
  {
    name: shortPersonalDetail[0].name,
    age: shortPersonalDetail[0].age,
    position: "Co-Fouder/CEO",
    workInfo: " ",
    imgUrl: shortPersonalDetail[0].imgUrl,
  },
  {
    name: shortPersonalDetail[1].name,
    age: shortPersonalDetail[1].age,
    position: "Co-Fouder/COO",
    workInfo: "",
    imgUrl: shortPersonalDetail[1].imgUrl,
  },
  {
    name: shortPersonalDetail[2].name,
    age: shortPersonalDetail[2].age,
    position: "Co-Fouder/CPO",
    workInfo: "",
    imgUrl: shortPersonalDetail[2].imgUrl,
  },
  {
    name: shortPersonalDetail[3].name,
    age: shortPersonalDetail[3].age,
    position: "Co-Fouder/CTO",
    workInfo: "",
    imgUrl: shortPersonalDetail[3].imgUrl,
  },
];

export default PersonalDetail;
