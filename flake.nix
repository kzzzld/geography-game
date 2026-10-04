{
  description = "kzzzl's geography game - a Vite-based flag quiz";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [ nodejs_22 ];
          shellHook = ''
            echo "kzzzl's geography game dev shell"
            echo "  npm install   # install dependencies"
            echo "  npm run dev   # start the dev server"
          '';
        };
      });

      packages = forAllSystems (pkgs: {
        default = pkgs.buildNpmPackage {
          pname = "kzzzl-geography-game";
          version = "0.0.0";
          src = ./.;
          npmDepsHash = "sha256-BkjU+Rwo1SkE22V4W3y3raJrrrkfUA/IfEM6jIl6/8Q=";
          npmBuildScript = "build";
          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r dist/. $out/
            runHook postInstall
          '';
          meta = with pkgs.lib; {
            description = "kzzzl's geography game, built with Vite";
            license = licenses.mit;
            platforms = systems;
          };
        };
      });

      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);
    };
}