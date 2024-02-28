import app from './src/app.js'

const port = process.env.PORT || 3080;


app.listen(port, () => {
  console.log(`BACKEND escutando na porta ${port}`)
})