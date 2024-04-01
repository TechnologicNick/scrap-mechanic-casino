import { getServerAuthSession } from "~/server/auth";
import CasinoNavbar from "@/components/casino-navbar";
import AddFundsModal from "@/components/add-funds-modal";
import Link from "next/link";

export default async function CasinoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <div className="relative grid h-full [grid-template-rows:auto_1fr]">
      <AddFundsModal />
      <header>
        <CasinoNavbar user={session?.user} />
      </header>
      <main>{children}</main>
      <footer className="absolute bottom-0 left-0 right-0">
        <p className="m-2 text-center text-sm text-gray-500/25">
          This website is not affiliated with Axolot Games.{" "}
          <Link href="/casino/privacy-policy">Privacy Policy</Link>
        </p>
      </footer>
    </div>
  );
}
