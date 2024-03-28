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

export const topLevelLinks = [
  { title: "Dice", href: "/casino/games/dice" },
  { title: "Roulette", href: "/casino/games/roulette" },
  { title: "Coinflip", href: "/casino/games/coinflip" },
] as const satisfies Array<{ title: string; href: string }>;

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
              href={link.href}
              color={pathname === link.href ? "primary" : "foreground"}
            >
              {link.title}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          {user ? (
            <Avatar isBordered color="primary" radius="sm" src={user.image!} />
          ) : (
            <Button as={Link} color="primary" href="#" variant="shadow">
              Login with Steam
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
