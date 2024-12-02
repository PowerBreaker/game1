class ChineseChess {
    constructor() {
        this.board = this.initBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.gridSize = 70; // 格子大小
        this.margin = 35;   // 边距
        this.redCaptured = [];
        this.blackCaptured = [];
        this.initGame();
    }

    initBoard() {
        const board = Array(10).fill().map(() => Array(9).fill(null));
        
        // 红方棋子
        const redPieces = {
            '車': [[0,0], [0,8]],
            '馬': [[0,1], [0,7]],
            '相': [[0,2], [0,6]],
            '仕': [[0,3], [0,5]],
            '帥': [[0,4]],
            '炮': [[2,1], [2,7]],
            '兵': [[3,0], [3,2], [3,4], [3,6], [3,8]]
        };

        // 黑方棋子
        const blackPieces = {
            '車': [[9,0], [9,8]],
            '馬': [[9,1], [9,7]],
            '象': [[9,2], [9,6]],
            '士': [[9,3], [9,5]],
            '將': [[9,4]],
            '炮': [[7,1], [7,7]],
            '卒': [[6,0], [6,2], [6,4], [6,6], [6,8]]
        };

        // 放置棋子
        for (let [piece, positions] of Object.entries(redPieces)) {
            positions.forEach(([row, col]) => {
                board[row][col] = { type: piece, color: 'red' };
            });
        }

        for (let [piece, positions] of Object.entries(blackPieces)) {
            positions.forEach(([row, col]) => {
                board[row][col] = { type: piece, color: 'black' };
            });
        }

        return board;
    }

    drawBoard() {
        const board = document.querySelector('.board-lines');
        const ctx = document.createElement('canvas');
        ctx.width = 700;
        ctx.height = 700;
        board.appendChild(ctx);
        
        const canvas = ctx.getContext('2d');
        canvas.strokeStyle = '#8b4513';
        canvas.lineWidth = 1;

        // 绘制横线
        for (let i = 0; i < 10; i++) {
            canvas.beginPath();
            canvas.moveTo(this.margin, this.margin + i * this.gridSize);
            canvas.lineTo(this.margin + 8 * this.gridSize, this.margin + i * this.gridSize);
            canvas.stroke();
        }

        // 绘制竖线
        for (let i = 0; i < 9; i++) {
            canvas.beginPath();
            canvas.moveTo(this.margin + i * this.gridSize, this.margin);
            canvas.lineTo(this.margin + i * this.gridSize, this.margin + 4 * this.gridSize);
            canvas.stroke();
            
            canvas.beginPath();
            canvas.moveTo(this.margin + i * this.gridSize, this.margin + 5 * this.gridSize);
            canvas.lineTo(this.margin + i * this.gridSize, this.margin + 9 * this.gridSize);
            canvas.stroke();
        }

        // 绘制楚河汉界
        const river = document.createElement('div');
        river.className = 'river';
        river.textContent = '楚 河 汉 界';
        board.appendChild(river);
    }

    initGame() {
        this.drawBoard();
        this.renderBoard();

        // 添加重新开始按钮事件
        document.getElementById('restart').addEventListener('click', () => {
            this.board = this.initBoard();
            this.currentPlayer = 'red';
            this.selectedPiece = null;
            this.redCaptured = [];
            this.blackCaptured = [];
            this.updateCapturedDisplay();
            this.renderBoard();
            
            const turnIndicator = document.querySelector('.turn-indicator');
            const piecePreview = turnIndicator.querySelector('.piece-preview');
            const status = document.getElementById('status');
            
            piecePreview.className = 'piece-preview red-piece';
            piecePreview.textContent = '帥';
            status.textContent = '红方回合';
        });

        // 添加棋盘点击事件
        document.getElementById('board').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left - this.margin;
            const y = e.clientY - rect.top - this.margin;
            
            // 计算最近的交叉点
            const col = Math.round(x / this.gridSize);
            const row = Math.round(y / this.gridSize);
            
            if (col >= 0 && col < 9 && row >= 0 && row < 10) {
                this.handleClick(row, col);
            }
        });
    }

    renderBoard() {
        const container = document.querySelector('.pieces-container');
        container.innerHTML = '';

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 9; j++) {
                const piece = this.board[i][j];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color}-piece`;
                    if (this.selectedPiece && this.selectedPiece.row === i && this.selectedPiece.col === j) {
                        pieceElement.classList.add('selected');
                    }
                    pieceElement.style.left = (j * this.gridSize + this.margin - 32) + 'px';
                    pieceElement.style.top = (i * this.gridSize + this.margin - 32) + 'px';
                    pieceElement.textContent = piece.type;
                    container.appendChild(pieceElement);
                }
            }
        }
    }

    // 检查移动是否合法
    isValidMove(startRow, startCol, endRow, endCol) {
        const piece = this.board[startRow][startCol];
        if (!piece) return false;

        const dx = Math.abs(endCol - startCol);
        const dy = Math.abs(endRow - startRow);
        
        // 获取起点和终点之间的棋子数量
        const getPiecesInPath = (startRow, startCol, endRow, endCol) => {
            let pieces = 0;
            if (startRow === endRow) {  // 横向
                const minCol = Math.min(startCol, endCol);
                const maxCol = Math.max(startCol, endCol);
                for (let col = minCol + 1; col < maxCol; col++) {
                    if (this.board[startRow][col]) pieces++;
                }
            } else if (startCol === endCol) {  // 纵向
                const minRow = Math.min(startRow, endRow);
                const maxRow = Math.max(startRow, endRow);
                for (let row = minRow + 1; row < maxRow; row++) {
                    if (this.board[startRow][col]) pieces++;
                }
            }
            return pieces;
        };

        switch (piece.type) {
            case '車':
                // 车只能直线移动
                return dx === 0 || dy === 0;

            case '馬':
                // 马走"日"字，不考虑蹩马腿
                return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);

            case '相':
            case '象':
                // 相/象可以任意移动，不受河界限制
                return dx === dy; // 保持斜线移动特性

            case '仕':
            case '士':
                // 士可以任意斜线移动，不受九宫格限制
                return dx === 1 && dy === 1;

            case '帥':
            case '將':
                // 将帅可以任意移动一格，不受九宫格限制
                return dx <= 1 && dy <= 1 && (dx + dy > 0);

            case '炮':
                // 炮的移动规则：直线移动
                if (dx === 0 || dy === 0) {
                    const targetPiece = this.board[endRow][endCol];
                    const piecesInPath = getPiecesInPath(startRow, startCol, endRow, endCol);
                    
                    if (targetPiece) {
                        // 吃子时需要有且仅有一个炮架
                        return piecesInPath === 1;
                    } else {
                        // 移动时中间不能有棋子
                        return piecesInPath === 0;
                    }
                }
                return false;

            case '兵':
            case '卒':
                // 兵/卒可以前进或横向移动一格
                return dx + dy === 1;

            default:
                return false;
        }
    }

    handleClick(row, col) {
        const piece = this.board[row][col];
        
        if (this.selectedPiece) {
            const [oldRow, oldCol] = [this.selectedPiece.row, this.selectedPiece.col];
            const selectedPiece = this.board[oldRow][oldCol];

            if (oldRow === row && oldCol === col) {
                // 点击同一个位置，取消选择
                this.selectedPiece = null;
            } else if (this.isValidMove(oldRow, oldCol, row, col)) {
                // 如果目标位置有棋子，记录被吃的棋子
                if (this.board[row][col]) {
                    const capturedPiece = this.board[row][col];
                    if (this.currentPlayer === 'red') {
                        this.redCaptured.push(capturedPiece);
                    } else {
                        this.blackCaptured.push(capturedPiece);
                    }
                    this.updateCapturedDisplay();
                }

                this.board[row][col] = selectedPiece;
                this.board[oldRow][oldCol] = null;
                this.selectedPiece = null;
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                const turnIndicator = document.querySelector('.turn-indicator');
                const piecePreview = turnIndicator.querySelector('.piece-preview');
                const status = document.getElementById('status');

                if (this.currentPlayer === 'red') {
                    piecePreview.className = 'piece-preview red-piece';
                    piecePreview.textContent = '帥';
                    status.textContent = '红方回合';
                } else {
                    piecePreview.className = 'piece-preview black-piece';
                    piecePreview.textContent = '將';
                    status.textContent = '黑方回合';
                }
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // 选择己方棋子
            this.selectedPiece = { row, col };
        }

        this.renderBoard();
    }

    updateCapturedDisplay() {
        const redCapturedEl = document.getElementById('red-captured');
        const blackCapturedEl = document.getElementById('black-captured');

        redCapturedEl.innerHTML = '';
        blackCapturedEl.innerHTML = '';

        this.redCaptured.forEach(piece => {
            const pieceEl = document.createElement('div');
            pieceEl.className = `captured-piece ${piece.color}`;
            pieceEl.textContent = piece.type;
            redCapturedEl.appendChild(pieceEl);
        });

        this.blackCaptured.forEach(piece => {
            const pieceEl = document.createElement('div');
            pieceEl.className = `captured-piece ${piece.color}`;
            pieceEl.textContent = piece.type;
            blackCapturedEl.appendChild(pieceEl);
        });
    }
}

// 开始游戏
new ChineseChess(); 