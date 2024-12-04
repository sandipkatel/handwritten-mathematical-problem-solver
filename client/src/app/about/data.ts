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
    imgUrl: "/media/team/sijan.jpg",
    },
];

shuffleArray(shortPersonalDetail)

const PersonalDetail: info[] = [
  {
    name: shortPersonalDetail[0].name,
    age: shortPersonalDetail[0].age,
    position: "Co-Fouder/CEO",
    workInfo: "is the strategic mastermind behind Infinity's vision. With his exceptional leadership skills and deep understanding of technological ecosystems, he drives the company's growth strategy. His entrepreneurial mindset combines technical knowledge with business acumen, enabling Infinity to navigate the complex landscape of AI innovation. Sandip's leadership is characterized by his ability to identify emerging technological trends and translate them into actionable business opportunities.",
    imgUrl: shortPersonalDetail[0].imgUrl,
  },
  {
    name: shortPersonalDetail[1].name,
    age: shortPersonalDetail[1].age,
    position: "Co-Fouder/COO",
    workInfo: "is the operational architect of Infinity, responsible for transforming our visionary concepts into executable strategies. With meticulous attention to detail and exceptional organizational skills, he ensures seamless coordination between different departments, manages resource allocation, and maintains the highest standards of operational efficiency. His strategic planning and execution capabilities are crucial in translating our technological vision into tangible results.",
   imgUrl: shortPersonalDetail[1].imgUrl,
  },
  {
    name: shortPersonalDetail[2].name,
    age: shortPersonalDetail[2].age,
    position: "Co-Fouder/CTO",
    workInfo: "as our technical virtuoso, leads our technological innovation and research initiatives. His profound expertise in artificial intelligence, machine learning, and software engineering forms the technological backbone of Infinity. Saphal continuously explores cutting-edge technologies, ensuring that our solutions remain at the forefront of innovation. His approach blends theoretical depth with practical implementation, creating robust and scalable AI solutions that push technological boundaries.",
    imgUrl: shortPersonalDetail[2].imgUrl,
  },
  {
    name: shortPersonalDetail[3].name,
    age: shortPersonalDetail[3].age,
    position: "Co-Fouder/CPO",
    workInfo: "drives our product strategy and user experience design. His unique ability to understand market needs and translate them into innovative AI solutions sets Infinity apart. With a keen eye for user-centric design and a deep understanding of technological potential, Sijan ensures that our products are not just technologically advanced but also intuitive and impactful. He leads our product development team in creating solutions that are both innovative and practical.",
    imgUrl: shortPersonalDetail[3].imgUrl,
  },
];

export default PersonalDetail;