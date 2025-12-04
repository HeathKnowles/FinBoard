"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { WidgetBuilder } from "./widgetBuilder";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const RealTimeStatus = dynamic(() => import("./realTimeStatus"), {
  loading: () => <div className="w-32 h-10 bg-gray-600 rounded animate-pulse" />,
  ssr: false,
});

export function Navbar () {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <nav className="bg-gray-800 w-full sticky top-0 z-50">
            <div className="px-2 sm:px-4 py-3 sm:py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-lg sm:text-xl font-bold hover:text-gray-300 transition-colors text-white truncate">
                        <span className="hidden sm:inline">Finance Dashboard</span>
                        <span className="sm:hidden">FinBoard</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {!isClient ? (
                            <>
                                <div className="w-20 sm:w-32 h-8 sm:h-10 bg-gray-600 rounded animate-pulse" />
                                <div className="w-16 sm:w-28 h-8 sm:h-10 bg-green-600/50 rounded animate-pulse" />
                            </>
                        ) : (
                            <>
                                <div className="hidden sm:block">
                                    <RealTimeStatus />
                                </div>
                                <WidgetBuilder />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}