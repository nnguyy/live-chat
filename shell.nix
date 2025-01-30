{ pkgs ? import <nixpkgs> { config.allowUnfree = true;} }:

pkgs.mkShell {
  buildInputs = [ 
    pkgs.nodejs 
    pkgs.nodePackages.npm 
    pkgs.mongodb
  ];
}
