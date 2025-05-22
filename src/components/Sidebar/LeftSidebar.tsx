import React from "react";
import { Home, Users, Settings } from "lucide-react";
import { FaChartLine } from "react-icons/fa6";
import { HiSpeakerphone } from "react-icons/hi";
import { TfiMenuAlt } from "react-icons/tfi";
import { TbLayoutSidebarLeftExpandFilled, TbStarsFilled } from "react-icons/tb";
import { BsFillChatDotsFill } from "react-icons/bs";
import { BiSolidCoupon } from "react-icons/bi";
import { MdOutlineChecklist } from "react-icons/md";
import { RiFolderImageFill } from "react-icons/ri";

const LeftSidebar: React.FC<{ onCreateGroup: () => void; onResetToDefault: () => void }> = ({ onCreateGroup, onResetToDefault }) => (
  <aside className="flex flex-col w-14 bg-gray-50 border-r border-gray-200 justify-between py-4" aria-label="Main navigation">
    <nav className="flex flex-col items-center gap-6">
      <button className="p-1.5 bg-green-600 rounded-lg flex justify-center" aria-label="Periskope home">
        <img src="/icons/periskope.png" alt="" className="w-5 h-5" />
      </button>
      <button className="p-1.5 text-gray-600 bg-green-50 rounded-lg flex justify-center" aria-label="Home">
        <Home size={15} aria-hidden="true" />
      </button>
      <button
        className="p-1.5 text-green-600 bg-green-50 rounded-lg flex justify-center"
        aria-label="Messages"
        onClick={onResetToDefault}
      >
        <BsFillChatDotsFill size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 bg-green-50 rounded-lg flex justify-center rotate-[135deg]" aria-label="Coupons">
        <BiSolidCoupon size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Analytics">
        <FaChartLine size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Menu">
        <TfiMenuAlt size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Announcements">
        <HiSpeakerphone size={15} aria-hidden="true" />
      </button>
      <button
        className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center"
        onClick={onCreateGroup}
        aria-label="Create group chat"
      >
        <Users size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Media">
        <RiFolderImageFill size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Tasks">
        <MdOutlineChecklist size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Settings">
        <Settings size={15} aria-hidden="true" />
      </button>
    </nav>
    <nav className="flex flex-col items-center gap-6" aria-label="Secondary navigation">
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Premium features">
        <TbStarsFilled size={15} aria-hidden="true" />
      </button>
      <button className="p-1.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg flex justify-center" aria-label="Collapse sidebar">
        <TbLayoutSidebarLeftExpandFilled size={15} aria-hidden="true" />
      </button>
    </nav>
  </aside>
);

export default LeftSidebar;