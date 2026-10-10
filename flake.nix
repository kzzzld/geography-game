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

      nixosModules.default =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        let
          cfg = config.services.kzzzl-geography-game;
          nginxConf = pkgs.writeText "kzzzl-geography-game-nginx.conf" ''
            worker_processes 1;
            daemon off;
            pid /run/kzzzl-geography-game/nginx.pid;
            error_log stderr;
            events { worker_connections 1024; }
            http {
              include ${pkgs.nginx}/conf/mime.types;
              default_type application/octet-stream;
              access_log /dev/stdout;
              client_body_temp_path /run/kzzzl-geography-game/client_temp;
              proxy_temp_path /run/kzzzl-geography-game/proxy_temp;
              fastcgi_temp_path /run/kzzzl-geography-game/fastcgi_temp;
              uwsgi_temp_path /run/kzzzl-geography-game/uwsgi_temp;
              scgi_temp_path /run/kzzzl-geography-game/scgi_temp;
              server {
                listen 127.0.0.1:${toString cfg.port};
                root ${cfg.package};
                index index.html;
                location / {
                  try_files $uri $uri/ /index.html;
                }
              }
            }
          '';
        in
        {
          options.services.kzzzl-geography-game = {
            enable = lib.mkEnableOption "kzzzl's geography game";
            port = lib.mkOption {
              type = lib.types.port;
              default = 8080;
              description = "Port to serve kzzzl's geography game on.";
            };
            package = lib.mkOption {
              type = lib.types.package;
              default = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
              description = "The kzzzl's geography game package to serve.";
            };
          };

          config = lib.mkIf cfg.enable {
            systemd.services.kzzzl-geography-game = {
              description = "kzzzl's geography game";
              wantedBy = [ "multi-user.target" ];
              after = [ "network.target" ];
              serviceConfig = {
                ExecStart = "${pkgs.nginx}/bin/nginx -e stderr -c ${nginxConf}";
                Restart = "on-failure";
                DynamicUser = true;
                RuntimeDirectory = "kzzzl-geography-game";
                AmbientCapabilities = [ "CAP_NET_BIND_SERVICE" ];
                CapabilityBoundingSet = [ "CAP_NET_BIND_SERVICE" ];
                NoNewPrivileges = true;
                ProtectSystem = "strict";
                ProtectHome = true;
                PrivateTmp = true;
              };
            };
          };
        };

      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);
    };
}
