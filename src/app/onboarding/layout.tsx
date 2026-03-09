export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <main className="pb-16 max-w-lg mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
