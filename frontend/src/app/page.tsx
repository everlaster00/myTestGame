import Link from "next/link";
import titleImg from "@/assets/titleImg.png"

export default function Home() {

  const titleBackGround = `url(${titleImg.src})`;

  const backgroundStyle = {
    backgroundImage: titleBackGround,
    backgroundSize: "100% 100%",
    backgroundPosition: "top",
    backgroundAttachment: "fixed",
  };

  return (
    <div className="TitleBox p-2 h-screen flex flex-col justify-center items-center gap-2"
      style={backgroundStyle}
      >
      <div className="Spacer h-[65%]"></div>
      <div className="ButtonBox w-[65%] flex flex-col justify-center items-center gap-2">
        <button className="StartButton px-4 py-2 rounded-lg bg-yellow-500/90 text-white text-xl font-semibold hover:bg-yellow-600 transition">
          <Link href={"/launching"}> 시작하기 </Link>
        </button>
      </div>
    </div>
  );
}
