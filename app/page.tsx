import Image from "next/image";
import Link from "next/link";
import { checkDbConnection } from "./db";
import Handler from "./handler/[...stack]/page";
import userPage from "./handler/[...stack]/user";


export default async function Home() {
  const result = await checkDbConnection();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
        <main className="flex flex-1 flex-col justify-left pt-20 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24">
          <div className="mb-6 md:mb-7">
       
       {await userPage()}

          </div>
          <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl md:leading-none lg:text-5xl lg:leading-none">
           ShowUp
          </h1>
          <p className="mt-3.5 max-w-lg text-base leading-snug tracking-tight text-[#61646B] md:text-lg md:leading-snug lg:text-xl lg:leading-snug dark:text-[#94979E]">
            A habit tracking app powered by intention and drive. 
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 md:mt-9 lg:mt-10">
          </div>
        </main>
      </div>
    </div>
  );
}
