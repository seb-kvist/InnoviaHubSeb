import type { ResourceType } from "../Interfaces/ResourceType";

const resourceData: ResourceType[] = [
  {
    id: 1,
    name: "Drop-in skrivbord",
    description: "En modern arbetsstation med bekvämt skrivbord och stol.",
    imageUrl: "/img/skrivbord.png",
    path: "/resource/1",
    isBookable: true,
  },
  {
    id: 2,
    name: "Mötesrum",
    description: "Ett fullt utrustat mötesrum med skärm och whiteboard.",
    imageUrl: "/img/motesrum.png",
    path: "/resource/2",
    isBookable: true,
  },
  {
    id: 3,
    name: "VR Headset",
    description: "Testa framtidens teknik med vårt VR-headset.",
    imageUrl: "/img/vrheadset.png",
    path: "/resource/3",
    isBookable: true,
  },
  {
    id: 4,
    name: "AI Server",
    description: "Kraftfull server för AI- och maskininlärningsprojekt.",
    imageUrl: "/img/aiserver.png",
    path: "/resource/4",
    isBookable: true,
  },
];
export default resourceData;
