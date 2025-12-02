import Link from "next/link";
import { Button } from "./ui/button";
import { WidgetBuilder } from "./widgetBuilder";

export function Navbar () {
    return (
        <nav className="bg-gray-800 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    Finance Dashboard
                </Link>
                <WidgetBuilder />
            </div>
        </nav>
    )
}