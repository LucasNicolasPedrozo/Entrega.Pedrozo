const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 8080;

app.use(express.json());

// Rutas para /api/products
const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
  const limit = req.query.limit;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo de productos' });
      return;
    }

    let products = JSON.parse(data);
    if (limit) {
      products = products.slice(0, parseInt(limit));
    }

    res.json(products);
  });
});

productsRouter.get('/:id', (req, res) => {
  const productId = req.params.id;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo de productos' });
      return;
    }

    const products = JSON.parse(data);
    const product = products.find((p) => p.id === parseInt(productId));

    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json(product);
  });
});

productsRouter.post('/', (req, res) => {
  const newProduct = req.body;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo de productos' });
      return;
    }

    const products = JSON.parse(data);
    const generatedId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    newProduct.id = generatedId;
    products.push(newProduct);

    fs.writeFile('productos.json', JSON.stringify(products), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al escribir en el archivo de productos' });
        return;
      }

      res.json(newProduct);
    });
  });
});

productsRouter.put('/:pid', (req, res) => {
  const productId = req.params.pid;
  const updatedProduct = req.body;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo de productos' });
      return;
    }

    let products = JSON.parse(data);
    const existingProduct = products.find((p) => p.id === parseInt(productId));

    if (!existingProduct) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const updatedFields = { ...existingProduct, ...updatedProduct };
    const updatedProducts = products.map((p) => (p.id === existingProduct.id ? updatedFields : p));

    fs.writeFile('productos.json', JSON.stringify(updatedProducts), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al escribir en el archivo de productos' });
        return;
      }

      res.json(updatedFields);
    });
  });
});

productsRouter.delete('/:pid', (req, res) => {
  const productId = req.params.pid;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo de productos' });
      return;
    }

    let products = JSON.parse(data);
    const updatedProducts = products.filter((p) => p.id !== parseInt(productId));

    fs.writeFile('productos.json', JSON.stringify(updatedProducts), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al escribir en el archivo de productos' });
        return;
      }

      res.json({ message: 'Producto eliminado correctamente' });
    });
  });
});

app.use('/api/products', productsRouter);

// Rutas para /api/carts
const cartsRouter = express.Router();

cartsRouter.post('/', (req, res) => {
  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo del carrito' });
      return;
    }

    const carts = JSON.parse(data);
    const generatedId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
    const newCart = { id: generatedId, products: [] };
    carts.push(newCart);

    fs.writeFile('carrito.json', JSON.stringify(carts), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al escribir en el archivo del carrito' });
        return;
      }

      res.json(newCart);
    });
  });
});

cartsRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo del carrito' });
      return;
    }

    const carts = JSON.parse(data);
    const cart = carts.find((c) => c.id === parseInt(cartId));

    if (!cart) {
      res.status(404).json({ error: 'Carrito no encontrado' });
      return;
    }

    res.json(cart.products);
  });
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al leer el archivo del carrito' });
      return;
    }

    let carts = JSON.parse(data);
    const cart = carts.find((c) => c.id === parseInt(cartId));

    if (!cart) {
      res.status(404).json({ error: 'Carrito no encontrado' });
      return;
    }

    const newProduct = { product: productId, quantity: 1 };
    cart.products.push(newProduct);

    fs.writeFile('carrito.json', JSON.stringify(carts), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al escribir en el archivo del carrito' });
        return;
      }

      res.json(newProduct);
    });
  });
});

app.use('/api/carts', cartsRouter);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
