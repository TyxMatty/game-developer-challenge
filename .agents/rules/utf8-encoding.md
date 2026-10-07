# Manipulação Segura de Arquivos UTF-8

1. **NUNCA** utilize comandos do PowerShell (como `Set-Content`, `Out-File` ou redirecionamento `>`) para sobrescrever ou editar arquivos de código de forma direta, pois eles quebram o encoding UTF-8 de arquivos com caracteres especiais (como acentos em português) e inserem um BOM (Byte Order Mark) invisível que pode quebrar builds do Vite ou Node.js.
2. **SEMPRE** utilize as ferramentas nativas de edição (como `write_to_file` ou `replace_file_content`). Estas ferramentas são escritas em Python pelo framework MCP e preservam a codificação UTF-8 corretamente.
3. Se o usuário explicitamente disser "deixa que eu arrumo os caracteres especiais", foque na lógica e não tente utilizar scripts customizados em Python/PowerShell no terminal para fazer linting ou refatorações massivas de texto.
