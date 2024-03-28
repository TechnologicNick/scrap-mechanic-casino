import { getServerAuthSession } from "~/server/auth";
import CasinoNavbar from "../_components/casino-navbar";

export default async function CasinoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <div className="grid h-full [grid-template-rows:auto_1fr_auto]">
      <header>
        <CasinoNavbar user={session?.user} />
      </header>
      <main>{children}</main>
      <footer>
        <p className="m-2 text-center text-sm text-gray-500">
          Scrap Mechanic Casino is an april fools joke. This website is not
          affiliated with Axolot Games.
        </p>
      </footer>
    </div>
  );
}
