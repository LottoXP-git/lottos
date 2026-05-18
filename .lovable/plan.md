## Objetivo
Adicionar ao `scripts/build-android.ps1` uma etapa que detecta automaticamente um JDK válido quando `JAVA_HOME` não está definido, evitando o erro "JAVA_HOME is not set" no Gradle.

## Mudança

Inserir nova etapa **"[0.5/4] Resolvendo JAVA_HOME..."** logo após a validação do `capacitor.config.ts` e antes do build web. Comportamento:

1. Se `$env:JAVA_HOME` já existir e `"$env:JAVA_HOME\bin\java.exe"` for válido → usar e mostrar versão.
2. Caso contrário, procurar em candidatos comuns (na ordem), o primeiro que contiver `bin\java.exe`:
   - `$env:JAVA_HOME` (caso esteja inválido, pular)
   - `C:\Program Files\Android\Android Studio\jbr`
   - `C:\Program Files\Android\Android Studio\jre`
   - `$env:LOCALAPPDATA\Programs\Android Studio\jbr`
   - `$env:LOCALAPPDATA\Programs\Android Studio\jre`
   - Maior versão encontrada em `C:\Program Files\Eclipse Adoptium\jdk-*`
   - Maior versão encontrada em `C:\Program Files\Java\jdk-*`
   - Maior versão encontrada em `C:\Program Files\Microsoft\jdk-*`
   - `$env:JDK_HOME` (se setado e válido)
3. Quando encontrar, definir `$env:JAVA_HOME` para o processo atual e prefixar `"$env:JAVA_HOME\bin"` em `$env:Path` (apenas durante a execução do script, sem alterar variáveis do sistema). Exibir `[OK] JAVA_HOME = ...`.
4. Se nada for encontrado, `Write-Fail` com instrução clara: instalar Temurin 17 (https://adoptium.net/temurin/releases/?version=17) ou Android Studio, ou setar `JAVA_HOME` manualmente.

A renumeração das etapas seguintes não é necessária — a etapa nova fica como `[0.5/4]` para minimizar mudanças visuais.

## Detalhe técnico

Usar helper local `Resolve-Jdk` que recebe lista de caminhos e retorna o primeiro válido (`Test-Path "$p\bin\java.exe"`). Para diretórios com wildcard (`jdk-*`), usar `Get-ChildItem -Directory` ordenado por `LastWriteTime` desc, escolhendo o primeiro com `bin\java.exe`.