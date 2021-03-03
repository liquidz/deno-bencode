test:
	deno test --coverage=./cov --unstable --allow-all

lint:
	deno fmt --check
	deno lint --unstable
