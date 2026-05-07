import { Zap } from "lucide-react";

const RouteLoader = () => {
	return (
		<div className="-m-6 md:-m-8 w-auto h-[calc(100dvh-3.5rem)] md:h-screen grid place-items-center bg-background overflow-hidden">
			<Zap className=" w-12 h-12 stroke-primary zap-draw" />
		</div>
	);
};

export default RouteLoader;
