#!/bin/bash
# Build script para Render

# Limpiar caché de npm
npm cache clean --force

# Instalar dependencias
npm install --legacy-peer-deps

# Build del proyecto
npm run build