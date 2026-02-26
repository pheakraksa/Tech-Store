// Search Section
    /* $(document).ready(function(){
        $('#search').on('keypress', function(e){
            // 13 = Enter key
            if(e.which === 13){
                let searchValue = $(this).val().toLowerCase().trim();
                let found = false;

                $('.product-card').each(function(){
                    let productName = $(this).find('.product-card-name').text().toLowerCase();

                    if(productName.includes(searchValue) && !found){
                        // smooth scroll to product
                        $('html,body').animate({
                            scrollTop: $(this).offset().top - 100
                        }, 600);

                        $(this).addClass("highlight");

                        setTimeout(() => {
                            $(this).removeClass("highlight");
                        }, 5000);

                        found = true;
                    };
                });
                if(!found){
                    alert('Product not found!');
                };
            };
        });
    });
*/
$(document).ready(function(){
    $('#search').on('input', function(){
        let searchValue = $(this).val().toLowerCase().trim();

        $('.product-card').each(function(){
            let productName = $(this).find('.product-card-name').text().toLowerCase();

            if(productName.includes(searchValue)){
                $(this).fadeIn(200); // Show matching item
            }else{
                $(this).fadeOut(200); // Hide non-matching items
            }
        })
    })
})


// Cart Section
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Elements
const cartBox = document.getElementById("cart");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

// Open / Close cart
cartBtn.onclick = () => cartBox.classList.add("active");
closeCart.onclick = () => cartBox.classList.remove("active");

// Add to cart
document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");

        const name = card.querySelector(".product-card-name").innerText;
        const price = Number(card.querySelector(".curr-price").innerText.replace("$", ""));
        const img = card.querySelector("img").src;

        const item = cart.find(p => p.name === name);

        if (item) {
            item.qty++;
        } else {
            cart.push({ name, price, img, qty: 1 });
        }

        saveCart();
        renderCart();
        cartBox.classList.add("active");
    });
});

// Render Cart Function
function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        count += item.qty;

        // Add cart item HTML
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div>
                <p>${item.name}</p>
                <p>$${item.price} × ${item.qty}</p>
                <button class="cart-btn decrease">-</button>
                <button class="cart-btn increase">+</button>
                <button class="cart-btn remove">Remove</button>
            </div>
        `;

        // Append to cart container
        cartItems.appendChild(cartItem);

        // Event listeners for buttons
        cartItem.querySelector(".increase").addEventListener("click", () => {
            item.qty++;
            saveCart();
            renderCart();
        });

        cartItem.querySelector(".decrease").addEventListener("click", () => {
            if(item.qty > 1) {
                item.qty--;
            } else {
                cart.splice(index, 1); // remove if qty = 1
            }
            saveCart();
            renderCart();
        });

        cartItem.querySelector(".remove").addEventListener("click", () => {
            cart.splice(index, 1); // remove item completely
            saveCart();
            renderCart();
        });
    });

    // Update total and count
    cartTotal.innerText = "$" + total;
    cartCount.innerText = count;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Initial render
renderCart();

/* Place Order with Confirmation Modal */
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutForm = document.getElementById("checkoutForm");

// Open modal
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    document.getElementById("confirmModal").style.display = "flex";
});

// Form submit
checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default form submission

    const name = document.getElementById("customerName").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const expiry = document.getElementById("cardExpiry").value;
    const cvc = document.getElementById("cardCVC").value.trim();

    // Basic validation
    if (!name || !cardNumber || !phoneNumber || !expiry || !cvc || !email) {
        alert("Please fill in all fields");
        return;
    }

    if (cardNumber.length < 12) {
        alert("Invalid card number");
        return;
    }
    
    if (phoneNumber.length < 9){
        alert("Invalid Phone number");
        return;
    }

    // Create order object
    const order = {
        customer: name,
        Phone: phoneNumber,
        Email:email,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        date: new Date().toLocaleString()
    };

    // Save orders
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Clear cart
    cart = [];
    localStorage.removeItem("cart");
    renderCart();
    renderOrders();

    // Clear modal input fields
    checkoutForm.reset();

    // Close modal and cart
    document.getElementById("confirmModal").style.display = "none";
    cartBox.classList.remove("active");

    alert("✅Payment successfully!");
});

// Cancel button
document.getElementById("confirmNo").addEventListener("click", () => {
    document.getElementById("confirmModal").style.display = "none";
    checkoutForm.reset();
});



/*=================== History ===================*/
/* show or hide order history*/
$('#viewOrdersBtn').click(function() {
    $('#ordersList').toggle(); // show/hide order history
    renderOrders(); // fill orders dynamically
});


function renderOrders() {
    const ordersList = document.getElementById("ordersList");
    ordersList.innerHTML = "";

    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (orders.length === 0) {
        ordersList.innerHTML = "<p>No orders yet.</p>";
        return;
    }

    orders.forEach((order, index) => {
        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order-card");

        let itemsHtml = "";
        order.items.forEach(item => {
            itemsHtml += `<p>${item.name} - $${item.price} × ${item.qty}</p>`;
        });

        orderDiv.innerHTML = `
            <h4>Order #${index + 1} - ${order.date}</h4>
            <p><strong>Customer: ${order.customer}</strong></p>
            <p><strong>Phone: ${order.Phone}</strong><p>
            <p><strong>Email: ${order.Email}</strong><p>
            ${itemsHtml}
            <p><strong>Total: $${order.total}</strong></p>
        `;

        ordersList.appendChild(orderDiv);
    });
}

// Call this function after page load
renderOrders();

function showToast(massage){
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = massage;
    container.appendChild(toast);

    //remove the toast after whenever we want
    setTimeout(() =>{
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    },3000);    
}