"use client";

import {
  Avatar,
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { PersonalAddFundsButton } from "./add-funds-button";
import { signIn } from "next-auth/react";

export const topLevelLinks = [
  { title: "Dice", href: "/casino/games/dice", visitable: true },
  { title: "Roulette", href: "/casino/games/roulette", visitable: false },
  { title: "Coinflip", href: "/casino/games/coinflip", visitable: false },
] as const satisfies Array<{ title: string; href: string; visitable: boolean }>;

export type CasinoNavbarProps = {
  user?: Session["user"];
};

export default function CasinoNavbar({ user }: CasinoNavbarProps) {
  const pathname = usePathname();

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">CASINO</p>
      </NavbarBrand>
      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        {topLevelLinks.map((link) => (
          <NavbarItem key={link.href} isActive={pathname === link.href}>
            <Link
              href={link.visitable ? link.href : undefined}
              color={pathname === link.href ? "primary" : "foreground"}
              className="cursor-pointer"
            >
              {link.title}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <PersonalAddFundsButton user={user} />
        </NavbarItem>
        <NavbarItem>
          {user ? (
            <Avatar isBordered color="primary" radius="sm" src={user.image!} />
          ) : (
            <Button
              color="primary"
              variant="shadow"
              onPress={() => signIn("steam")}
            >
              Login with Steam
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
