# Como publicar uma atualização do DIVISA

Runbook para quando o app já estiver na Play Store. Escrito em português
porque é um documento operacional — quem segue estes passos é o dono do app,
possivelmente às pressas, com um bug em produção.

---

## Primeiro: qual dos dois caminhos?

| | OTA (`eas update`) | Build novo (`eas build`) |
| --- | --- | --- |
| Chega no usuário em | minutos | horas a dias (revisão da Google) |
| Precisa da Google? | não | sim |
| Atualiza | só o JavaScript | tudo |

**Use OTA quando a mudança for só JavaScript:** telas, textos, traduções,
lógica de negócio, correção de bug, estilo, chamadas de API.

**Precisa de build novo quando:**

- instalou ou removeu qualquer pacote com código nativo
  (`expo-*`, `react-native-*`, qualquer coisa com pasta `android/`)
- mudou `app.json` em algo que vira configuração nativa: ícone, splash,
  permissões, `package`, `plugins`, `orientation`
- subiu a versão do SDK do Expo ou do React Native
- quer mudar o número de versão que aparece na loja

**Na dúvida, faça build novo.** Um OTA que não devia ter sido OTA quebra o app
de quem já instalou, e você não tem como desfazer no aparelho da pessoa.

Existe uma rede de segurança: o `runtimeVersion` está no modo `fingerprint`.
O Expo calcula uma impressão digital da camada nativa, e um OTA só alcança
builds cuja parte nativa é compatível. Se você mudar uma dependência nativa,
os builds antigos simplesmente **não recebem** a atualização — em vez de
receberem e quebrarem. Isso protege contra o erro acima, mas não substitui
pensar antes.

---

## Caminho 1 — OTA

```bash
cd mobile
npx eas update --branch production --message "descreva o que mudou"
```

O que acontece no aparelho do usuário: na próxima vez que ele abrir o app, a
atualização é **baixada em segundo plano** e aplicada **na abertura seguinte**.
Ou seja, quem estiver com o app aberto agora só vê a mudança depois de fechar
e abrir duas vezes.

Isso é proposital (`fallbackToCacheTimeout: 0`): a alternativa seria travar a
abertura do app esperando a rede, o que é pior — ainda mais em celular lento
ou sem sinal.

### Publicar para uma fatia dos usuários primeiro

Para uma mudança arriscada, mande para 10% antes de mandar para todo mundo:

```bash
npx eas update --branch production --rollout-percentage 10 -m "descreva"
```

Se ninguém reclamar, repita sem o `--rollout-percentage` para liberar geral.
Vale principalmente para qualquer coisa que toque em dinheiro na tela.

### Se publicou um OTA quebrado

Republique o anterior — não existe "desinstalar" um update:

```bash
npx eas update:list --branch production     # ache o ID do grupo bom
npx eas update:republish --group <ID>
```

Lembre que o conserto também só chega na abertura seguinte do app. Por isso o
lançamento gradual acima vale mais que a capacidade de reverter.

---

## Caminho 2 — build novo para a loja

1. **Suba a versão visível** em `app.json` → `expo.version`
   (`1.0.0` → `1.0.1` para correção, `1.1.0` para novidade).

   Não mexa em `android.versionCode`. O `eas.json` usa
   `appVersionSource: "remote"` com `autoIncrement: true` no perfil de
   produção, então o EAS incrementa sozinho. Esse é o número que a Google usa
   para saber qual build é mais novo, e reenviar um número já usado é o erro
   que mais trava envio.

2. **Gere o build:**

   ```bash
   cd mobile
   npx eas build --platform android --profile production
   ```

3. **Envie para a Play Store:**

   ```bash
   npx eas submit --platform android --latest
   ```

   Na primeira vez o `eas submit` pede uma chave de serviço do Google Play
   Console (Configurações → Acesso à API). Depois disso fica guardada.

4. Acompanhe a revisão no Play Console. Pode levar de horas a alguns dias.

---

## Antes de qualquer lançamento

- [ ] Testar no aparelho de verdade, não só no `expo start --web`. Vários bugs
      deste projeto só apareceram em hardware real — o modo escuro que voltava
      sozinho, a velocidade de reprodução que não mudava.
- [ ] `npx expo-doctor` sem erros
- [ ] Se mexeu no backend, ler a seção abaixo

---

## A regra que mais importa: backend x app antigo

Backend e app atualizam em ritmos diferentes:

- **Railway** publica a cada push, instantaneamente, para todos os usuários
- **O app no celular** pode ser de meses atrás, e não há como obrigar ninguém
  a atualizar

Isso significa que **mudar o formato de uma resposta da API quebra os apps já
instalados**. E isso nunca aparece em teste, porque no desenvolvimento os dois
lados estão sempre atualizados juntos.

Então, ao mexer na API:

- **Pode:** adicionar um campo novo na resposta; adicionar uma rota nova;
  aceitar um campo opcional novo no corpo da requisição.
- **Não pode sem planejar:** renomear ou remover um campo; mudar o tipo de um
  campo; tornar obrigatório um campo que era opcional; mudar o código de
  status que uma rota devolve.

Quando precisar mesmo mudar algo assim: mantenha o campo antigo funcionando
por algumas versões, lance o app que usa o novo, espere a adoção, e só então
remova o antigo.

---

## Numeração de versão

| Campo | Onde | Quem mexe | O que é |
| --- | --- | --- | --- |
| `expo.version` | `app.json` | você, manualmente | o que o usuário vê na loja |
| `versionCode` | remoto, no EAS | automático | número interno da Google, sempre crescente |
| `runtimeVersion` | `app.json` | automático (`fingerprint`) | define quais builds recebem um OTA |

---

## Pendências conhecidas

- **O OTA nunca foi testado em aparelho real neste projeto.** A configuração
  está feita e é a padrão do Expo, mas só dá para confiar depois de um teste
  de verdade: gerar um build `preview`, instalar no celular, publicar um
  `eas update` com uma mudança visível e confirmar que ela chega. Faça isso
  **antes** de depender de OTA para uma correção urgente.

  Vale saber: no projeto irmão (TechSpeaking) o `eas update` foi configurado e
  a primeira tentativa real não chegou a aplicar no aparelho, sem diagnóstico,
  e o projeto voltou a usar builds completos. Pode ter sido um detalhe daquele
  projeto, mas é motivo suficiente para não assumir que funciona.

- **O `expo-updates` só existe em builds gerados depois desta configuração.**
  Quem instalar um APK anterior a ela nunca receberá OTA, por mais que você
  publique — para aquela instalação, só build novo pela loja.

- `npx expo-doctor` aponta 5 pacotes atrás em versão de patch. Foram deixados
  como estão de propósito, para não trocar dependências em cima de um
  lançamento. Atualize com `npx expo install --check` num momento calmo, e
  gere um build de teste depois.
