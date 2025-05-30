import { cn } from "@/lib/utils";

interface CurrencySymbolProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export const CurrencySymbol = ({
}: CurrencySymbolProps) => {


    return (
        <span
        >
            €
        </span>
    );
}; 