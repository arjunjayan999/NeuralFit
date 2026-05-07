import Navbar from "./Navbar";

const Layout = ({ children }) => (
	<div className="min-h-screen bg-background">
		<Navbar />
		<main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
			<div className="p-6 md:p-8 max-w-6xl mx-auto">{children}</div>
		</main>
	</div>
);

export default Layout;
