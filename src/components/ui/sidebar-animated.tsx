"use client";

import { cn } from "@/lib/utils";
import Link, { type LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>{children}</SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      {/* Spacer to reserve 60px in the flex flow */}
      <div className="hidden md:block w-[60px] flex-shrink-0" />
      {/* Actual sidebar — fixed position, overlays content on expand */}
      <motion.div
        className={cn(
          "h-screen py-4 hidden md:flex md:flex-col bg-background border-r w-[240px] flex-shrink-0 fixed left-0 top-0 z-40 overflow-hidden",
          className,
        )}
        animate={{
          width: animate ? (open ? "240px" : "60px") : "240px",
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({ className, children, ...props }: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className="h-14 px-4 flex flex-row md:hidden items-center justify-between bg-background border-b w-full"
        {...props}
      >
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Actant
        </Link>
        <div className="flex justify-end z-20">
          <Menu className="text-foreground cursor-pointer size-5" onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-background p-6 z-[100] flex flex-col justify-between",
                className,
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 text-foreground cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X className="size-5" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  active,
  ...props
}: {
  link: Links;
  className?: string;
  active?: boolean;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-0 group/sidebar py-2 rounded-md transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {/* Fixed-width icon column — stays centered in collapsed state */}
      <div className="w-[60px] flex items-center justify-center shrink-0">{link.icon}</div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

export const SidebarLabel = ({ label, className }: { label: string; className?: string }) => {
  const { open, animate } = useSidebar();
  return (
    <motion.div
      animate={{
        height: animate ? (open ? "auto" : 0) : "auto",
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <span
        className={cn(
          "block text-xs font-medium uppercase tracking-wider text-muted-foreground px-5 pt-4 pb-1",
          className,
        )}
      >
        {label}
      </span>
    </motion.div>
  );
};
