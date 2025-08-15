import React from "react";
import { LogoutButton } from "@/components/logout-button";
import { auth } from "@/auth";
import packageJson from "@/package.json";

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <div className="h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 text-white flex flex-col overflow-hidden">
      <header className="p-4 border-b border-amber-400/20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-amber-400/10 border border-amber-400/20">
              <span className="text-xl">☿</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-amber-200">
                IALchemist
              </h1>
              {session?.user?.email && (
                <p className="text-sm text-gray-400">{session.user.email}</p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
      <footer className="p-4 max-h-10 border-t border-amber-400/20">
        <div className="flex flex-col items-center justify-center gap-2 mx-auto text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} IALchemist. All rights reserved. v
            {packageJson.version}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
