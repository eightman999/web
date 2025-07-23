const products = [
    { id: 1, name: 'Echo Dot', price: 49.99, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Fire Tablet', price: 89.99, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Kindle', price: 79.99, image: 'https://via.placeholder.com/150' }
];

function renderProducts() {
    const grid = document.getElementById('product-grid');
    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `<img src="${p.image}" alt="${p.name}">
                         <h3>${p.name}</h3>
                         <p>$${p.price.toFixed(2)}</p>`;
        grid.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', renderProducts);
