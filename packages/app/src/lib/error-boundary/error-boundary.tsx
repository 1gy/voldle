import { Component, type ReactNode } from "react";

type Props = {
	children: ReactNode;
	fallback: (error: Error) => ReactNode;
};

type State = {
	error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	render() {
		return this.state.error
			? this.props.fallback(this.state.error)
			: this.props.children;
	}
}
