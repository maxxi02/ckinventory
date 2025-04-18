import { MainButton } from "@/components/MainButton";
import { BackgroundLines } from "@/components/ui/background-lines";
import { getServerSession } from "@/lib/action";
import Image from "next/image";
import Link from "next/link";
import { RiBox3Fill } from "react-icons/ri";

export default async function Home() {
  const session = await getServerSession();
  return (
    <BackgroundLines>
      <div className="flex items-center justify-evenly z-95 mx-auto px-0 md:px-5  w-full max-w-7xl ">
        {/* DESCRIPTION */}
        <div className="scale z-95 flex flex-col items-center md:items-start justify-center w-full h-screen flex-1">
          <h2 className="bg-clip-text text-transparent text-center md:text-start bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
            <span className="flex items-center">
              <RiBox3Fill
                className="dark:text-[whitesmoke] text-black hidden md:block"
                size={80}
              />
              CloudKings
            </span>
            Inventory
          </h2>
          <p className="max-w-xl  text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center md:text-start">
            Streamline your stock control with our smart inventory management
            system powered by barcode scanning. Track, update, and organize your
            inventory in real-time with speed and accuracy—reducing errors,
            minimizing waste, and maximizing efficiency.
          </p>
          <MainButton className="w-max p-2 mt-4">
            <Link href={session ? "/dashboard " : "/sign-in"}>
              {session ? <>Dashboard</> : <>Get Started</>}
            </Link>
          </MainButton>
        </div>
        {/* IMAGE */}
        <div className="flex-1 z-95 relative w-auto h-[800px] hidden md:block">
          <Image
            src="/hero-image.png"
            alt="hero-image"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </BackgroundLines>
  );
}
