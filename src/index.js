document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    document.getElementById('new-quote-form').addEventListener('submit', handleNewQuote);
    const sortBtn = document.createElement('button');
    const unsortBtn = document.createElement('button');
    sortBtn.innerText = 'Sort by Author';
    unsortBtn.innerText = 'Sort by ID';
    sortBtn.setAttribute('id', 'sort-button');
    unsortBtn.setAttribute('hidden', 'hidden');
    unsortBtn.setAttribute('id', 'unsort-button');
    document.getElementById('quote-list').parentNode.appendChild(sortBtn);
    document.getElementById('quote-list').parentNode.appendChild(unsortBtn);
    sortBtn.addEventListener('click', handleSortQuotes);
    unsortBtn.addEventListener('click', () => {
        console.log('unsort');
        document.getElementById('sort-button').removeAttribute('hidden');
        document.getElementById('unsort-button').setAttribute('hidden', 'hidden');
        loadQuotes();
    });
});

function loadQuotes() {
    const quoteList = document.getElementById('quote-list');
    while (quoteList.firstChild) {quoteList.removeChild(quoteList.firstChild)};
    fetch('http://localhost:3000/quotes?_embed=likes')
    .then(res => res.json())
    .then(json => json.forEach(quote => loadOneQuote(quote)));
}

function loadOneQuote(quote) {
    if (quote.quote) {
        const quoteList = document.getElementById('quote-list');
        const card = document.createElement('li');
        const block = document.createElement('blockquote');
        const p = document.createElement('p');
        const footer = document.createElement('footer');
        const successBtn = document.createElement('button');
        const likes = document.createElement('span');
        const editBtn = document.createElement('button');
        const dangerBtn = document.createElement('button');

        card.setAttribute('id', quote.id);
        card.setAttribute('class', 'quote-card');
        block.setAttribute('class', 'blockquote');
        p.setAttribute('class', 'mb-0');
        footer.setAttribute('class', 'blockquote-footer');
        successBtn.setAttribute('class', 'btn-success');
        editBtn.setAttribute('class', 'btn-edit');
        dangerBtn.setAttribute('class', 'btn-danger');

        p.innerText = quote.quote;
        footer.innerText = quote.author;
        successBtn.innerText = 'Likes: ';
        likes.innerText = quote.likes.length;
        editBtn.innerText = 'Edit Quote';
        dangerBtn.innerText = 'Delete';

        quoteList.appendChild(card).appendChild(block).appendChild(p);
        block.appendChild(footer);
        block.appendChild(document.createElement('br'));
        block.appendChild(successBtn);
        block.appendChild(likes);
        block.appendChild(editBtn);
        block.appendChild(dangerBtn);

        successBtn.addEventListener('click', handleLike);
        editBtn.addEventListener('click', handleEdit);
        dangerBtn.addEventListener('click', handleDelete);
    }
}

function handleLike(event) {
    const quoteId = parseInt(event.target.parentNode.parentNode.id);
    fetch('http://localhost:3000/likes', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            'quoteId': quoteId,
            'createdAt': parseInt(new Date().getTime() / 1000),
        }),
    })
    .then(() => loadQuotes());
}

function handleDelete(event) {
    const quoteId = event.target.parentNode.parentNode.id;
    fetch(`http://localhost:3000/quotes/${quoteId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': "application/json",
            accept: "application/json",
        },
    })
    .then(() => loadQuotes());
}

function handleNewQuote(event) {
    event.preventDefault();
    const form = event.target;
    const quote = form.querySelector('#new-quote').value;
    const author = form.querySelector('#author').value;
    fetch('http://localhost:3000/quotes', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            quote: quote,
            author: author,
        }),
    })
    .then(() => {
        form.reset();
        loadQuotes();
    });
}

function handleEdit(event) {
    const block = event.target.parentNode;
    const editBtn = event.target;
    const quoteId = block.parentNode.id;
    const quote = block.querySelector('.mb-0');
    const author = block.querySelector('.blockquote-footer');
    const quoteInput = document.createElement('input');
    const authorInput = document.createElement('input');

    quote.setAttribute('hidden', 'hidden');
    author.setAttribute('hidden', 'hidden');
    quoteInput.setAttribute('type', 'text');
    authorInput.setAttribute('type', 'text');

    editBtn.innerText = 'Save Changes';
    quoteInput.value = quote.innerText;
    authorInput.value = author.innerText;

    block.insertBefore(quoteInput, quote);
    block.insertBefore(authorInput, author);
    block.insertBefore(document.createElement('br'), authorInput);

    editBtn.addEventListener('click', event => {
        fetch(`http://localhost:3000/quotes/${quoteId}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify({
                quote: quoteInput.value,
                author: authorInput.value,
            }),
        })
        .then(() => loadQuotes());
    });
}

function handleSortQuotes(event) {
    console.log('sort');
    const quoteList = document.getElementById('quote-list');
    const quotes = quoteList.children;
    const quotesArray = [];
    for (element in quotes) {
        if (typeof(quotes[element]) === 'object'){
            quotesArray.push({
                id: quotes[element].id,
                author: quotes[element].querySelector('blockquote-footer')
            });
        }
    };
    fetch('http://localhost:3000/quotes?_sort=author')
    .then(res => res.json())
    .then(json => {
        for (element in json) {
            quoteList.appendChild(document.getElementById(`${json[element].id}`));
        };
        event.target.setAttribute('hidden', 'hidden');
        document.getElementById('unsort-button').removeAttribute('hidden');
    })
}