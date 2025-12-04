"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { WidgetBuilder } from "./widgetBuilder";
import dynamic from "next/dynamic";

const RealTimeStatus = dynamic(() => import("./realTimeStatus"), {
  loading: () => <div className="w-32 h-8 bg-gray-700 rounded animate-pulse" />,
  ssr: false,
});

export function Navbar () {
    return (
        <nav className="bg-gray-800 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    Finance Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <RealTimeStatus />
                    <WidgetBuilder />
                </div>
            </div>
        </nav>
    )
}