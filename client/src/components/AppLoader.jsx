import UseAnimationsImport from "react-useanimations";
import { Zap } from "lucide-react";
import loading2Import from "react-useanimations/lib/loading2";

const UseAnimations = UseAnimationsImport.default || UseAnimationsImport;

const loading2 = loading2Import.default || loading2Import;

const AppLoader = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-transparent rounded-xl flex items-center justify-center">
                <Zap className="w-96 h-96 text-primary-foreground zap-draw stroke-primary" />
            </div>
            <div className="flex items-center">
                <UseAnimations
                    animation={loading2}
                    strokeColor="var(--background)"
                    fillColor="#efb100"
                />
                <p className="text-sm pl-2 text-muted-foreground">
                    Checking Your Session
                </p>
            </div>
        </div>
    </div>
);

export default AppLoader;