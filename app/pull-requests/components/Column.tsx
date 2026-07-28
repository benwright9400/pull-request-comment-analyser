import Loader from "@/app/components/Loader";

export default function Column({
    title,
    isLoading,
    isEmpty,
    emptyMessage,
    children,
}: {
    title: string;
    isLoading: boolean;
    isEmpty: boolean;
    emptyMessage: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 min-w-0 border-r border-white/10 last:border-r-0 flex flex-col">
            <h2 className="px-4 py-3 text-sm font-semibold dark:text-white text-black border-b border-white/10 shrink-0">
                {title}
            </h2>
            <div className="overflow-y-auto flex-1 flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader />
                    </div>
                ) : isEmpty ? (
                    <p className="px-4 py-3 text-sm dark:text-gray-300 text-gray-600">{emptyMessage}</p>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
