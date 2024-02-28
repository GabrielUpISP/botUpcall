import app from './src/app.js'

const port = process.env.PORT || 80;


app.listen(port, () => {
  console.log(`BACKEND escutando na porta ${port}`)
})