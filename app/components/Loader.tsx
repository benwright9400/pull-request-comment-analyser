import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function Loader() {
    return (
        <div className="flex items-center justify-center py-8">
            <ArrowPathIcon className="size-6 animate-spin text-gray-400" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
        </div>
    );
}
