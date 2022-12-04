.PHONY: test
test:
	deno test --coverage=./cov --unstable --allow-all

.PHONY: lint
lint:
	deno fmt --check *.ts
	deno lint --unstable

.PHONY: install-udd
install-udd:
	deno install -rf --allow-read=. --allow-write=. --allow-net https://deno.land/x/udd/main.ts

.PHONY: outdated
outdated:
	udd deps.ts

.PHONY: install-deno-cache-injector
install-deno-cache-injector:
	deno install -n deno-cache-injector --allow-env --allow-read --allow-write https://deno.land/x/cache_injector@1.0.0/injector.ts

.PHONY: install
# https://github.com/kuuote/deno-cache-injector
# deno install -n deno-cache-injector --allow-env --allow-read --allow-write https://deno.land/x/cache_injector@1.0.0/injector.ts
install:
	deno-cache-injector ./ https://deno.land/x/deno_bencode@9.9.9
