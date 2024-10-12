// Initial page state
let currentPage = 1;
let currentMonth = 3;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  fetchTransactions();
  fetchStatistics();
  fetchBarChart();
});

// Event Listeners
document.getElementById('monthSelect').addEventListener('change', (e) => {
  currentMonth = e.target.value;
  currentPage = 1;
  fetchTransactions();
  fetchStatistics();
  fetchBarChart();
});

document.getElementById('transactionSearch').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  fetchTransactions();
});

document.getElementById('nextPage').addEventListener('click', () => {
  currentPage++;
  fetchTransactions();
});

document.getElementById('prevPage').addEventListener('click', () => {
  currentPage--;
  fetchTransactions();
});

// Fetch Transactions from API
function fetchTransactions() {
  fetch(`/api/transactions?month=${currentMonth}&search=${searchQuery}&page=${currentPage}`)
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector('#transactionsTable tbody');
      tbody.innerHTML = ''; // Clear existing rows
      data.transactions.forEach(txn => {
        const row = `<tr>
                      <td>${txn.title}</td>
                      <td>${txn.description}</td>
                      <td>${txn.price}</td>
                      <td>${txn.date}</td>
                    </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
      });

      document.getElementById('prevPage').disabled = currentPage === 1;
      document.getElementById('nextPage').disabled = data.isLastPage;
    })
    .catch(error => console.error('Error fetching transactions:', error));
}

// Fetch Statistics from API
function fetchStatistics() {
  fetch(`/api/transactions/stats?month=${currentMonth}`)
    .then(response => response.json())
    .then(stats => {
      document.getElementById('totalSales').textContent = stats.totalSales;
      document.getElementById('soldItems').textContent = stats.soldItems;
      document.getElementById('notSoldItems').textContent = stats.notSoldItems;
    })
    .catch(error => console.error('Error fetching statistics:', error));
}

// Fetch Bar Chart Data from API and render chart
function fetchBarChart() {
  fetch(`/api/transactions/price-range?month=${currentMonth}`)
    .then(response => response.json())
    .then(priceData => {
      const ctx = document.getElementById('transactionsBarChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: priceData.ranges,
          datasets: [{
            label: '# of Items',
            data: priceData.itemCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
    .catch(error => console.error('Error fetching price range data:', error));
}
