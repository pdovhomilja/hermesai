import { auth } from "@/auth";
import Link from "next/link";
import React from "react";

const AppPage = async ({ params }: { params: Promise<{ cid: string }> }) => {
  const { cid } = await params;
  const session = await auth();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Company Dashboard: {cid}</h1>
      <p className="mb-4">Welcome, {session?.user?.email}</p>
      
      <nav className="space-y-2">
        <div>
          {/* For company-specific routes, use href with pathname object */}
          <Link 
            href={`/${cid}/chat`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Chat
          </Link>
        </div>
        <div>
          <Link 
            href={`/${cid}/settings`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Company Settings
          </Link>
        </div>
        <div>
          <Link 
            href={`/${cid}/users`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Manage Users
          </Link>
        </div>
        <div>
          {/* For defined routes, use simple string */}
          <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">
            About (Global Route)
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AppPage;
