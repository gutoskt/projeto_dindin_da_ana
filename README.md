# <img src="app/imagens/imagem2.jpg" alt="Dindin da Ana" width="92" align="left" /> Dindin da Ana

Aplicativo de gestão de sabores, estoque, vendas, receitas e resultados do Dindin da Ana.

![Logo Dindin da Ana](app/imagens/imagem2.jpg)

## Identidade visual

A identidade principal usa o azul `#0081CC`, com azuis claros para superfícies e estados de apoio.

## Desenvolvimento

### Variáveis de ambiente

As credenciais e configurações locais ficam fora do GitHub. O arquivo real `backend/.env` é ignorado pelo Git e não deve ser publicado.

Para configurar o backend localmente:

```bash
Copy-Item backend/.env.example backend/.env
```

Preencha os valores do PostgreSQL em `backend/.env`. Para o app, use `.env` apenas se precisar substituir a URL padrão da API:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Arquivos protegidos pelo `.gitignore` incluem `.env`, `backend/.env`, `node_modules/`, `.expo/`, builds, logs, caches, cobertura de testes, certificados e arquivos de credenciais. Os arquivos `.env.example` são modelos sem segredos e podem ser enviados ao GitHub.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
