# NixOS

The repository ships a Nix flake providing three things:

- a **dev shell** with Node 22,
- a **package** that builds the static site, and
- a **NixOS module** that serves it with nginx.

## Dev shell

```bash
nix develop
```

Drops you into a shell with `nodejs_22` and prints the usual `npm install` /
`npm run dev` hints.

## Build the package

```bash
nix build
```

The static site is written to `result/` (a symlink into the Nix store). It's
built with `pkgs.buildNpmPackage`, running the `build` npm script and copying
`dist/` into the output.

> The flake pins `npmDepsHash` for the `npm ci` dependency set. If you change
> `package-lock.json`, the hash must be updated or the build will fail with a
> hash mismatch (see [Troubleshooting](Troubleshooting.md)).

## NixOS module

Add the flake as an input and import the module:

```nix
{
  inputs.geography-game.url = "github:kzzzld/geography-game";

  outputs = { nixpkgs, geography-game, ... }: {
    nixosConfigurations.myvps = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./configuration.nix
        geography-game.nixosModules.default
      ];
    };
  };
}
```

Then enable the service:

```nix
{
  services.kzzzl-geography-game.enable = true;
  services.kzzzl-geography-game.port = 8080; # default
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enable` | bool | `false` | Turn the service on |
| `port` | port | `8080` | Port nginx listens on |
| `package` | package | the flake's package | The static site to serve |

### What the module does

- Defines a `systemd.services.kzzzl-geography-game` unit running nginx.
- nginx serves the package's `root` with `try_files $uri $uri/ /index.html`
  (single-page fallback).
- Binds to **`127.0.0.1:<port>`** — it is meant to sit behind a reverse proxy,
  not be exposed directly.
- Logs to stderr and disables the access log (the access log can't be written
  under the sandbox).
- Hardens the unit: `DynamicUser`, `NoNewPrivileges`, `ProtectSystem = "strict"`,
  `ProtectHome`, `PrivateTmp`, and a `RuntimeDirectory` for nginx's temp/pid
  files.
- Grants `CAP_NET_BIND_SERVICE` so it can bind a privileged port if you choose
  one below 1024.

## Reverse proxy example

```nix
{
  services.nginx = {
    enable = true;
    virtualHosts."geog.example.com" = {
      forceSSL = true;
      enableACME = true;
      locations."/".proxyPass = "http://127.0.0.1:8080";
    };
  };

  networking.firewall.allowedTCPPorts = [ 80 443 ];
}
```

## Updating

Because the flake input points at a branch, update with:

```bash
nix flake update geography-game
```

Related: [Building](Building.md) · [Troubleshooting](Troubleshooting.md)
