import { RiBox3Fill } from "react-icons/ri";

const LogoHeader = () => {
  return (
    <span className="bg-clip-text flex items-center text-transparent text-start bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-2xl font-sans py-2 md:py-3 relative z-20 font-bold tracking-tight">
      <RiBox3Fill className="dark:text-[whitesmoke] text-black text-4xl" />
      CloudKings
    </span>
  );
};

export default LogoHeader;
