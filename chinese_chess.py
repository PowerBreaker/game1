class ChineseChess:
    def __init__(self):
        # 初始化棋盘
        self.board = self.init_board()
        self.current_player = '红'  # 红方先走
        
    def init_board(self):
        # 创建空棋盘
        board = [[' ' for _ in range(9)] for _ in range(10)]
        
        # 布置红方棋子
        board[0][0] = '車'
        board[0][1] = '馬'
        board[0][2] = '相'
        board[0][3] = '仕'
        board[0][4] = '帥'
        board[0][5] = '仕'
        board[0][6] = '相'
        board[0][7] = '馬'
        board[0][8] = '車'
        board[2][1] = '炮'
        board[2][7] = '炮'
        board[3][0] = '兵'
        board[3][2] = '兵'
        board[3][4] = '兵'
        board[3][6] = '兵'
        board[3][8] = '兵'
        
        # 布置黑方棋子
        board[9][0] = '車'
        board[9][1] = '馬'
        board[9][2] = '象'
        board[9][3] = '士'
        board[9][4] = '將'
        board[9][5] = '士'
        board[9][6] = '象'
        board[9][7] = '馬'
        board[9][8] = '車'
        board[7][1] = '炮'
        board[7][7] = '炮'
        board[6][0] = '卒'
        board[6][2] = '卒'
        board[6][4] = '卒'
        board[6][6] = '卒'
        board[6][8] = '卒'
        
        return board
    
    def display_board(self):
        print('\n  0 1 2 3 4 5 6 7 8')
        print('  ─────────────────')
        for i in range(10):
            print(f'{i}│', end=' ')
            for j in range(9):
                print(self.board[i][j], end=' ')
            print()
            
    def make_move(self):
        while True:
            try:
                print(f'\n当前回合：{self.current_player}方')
                start = input('请输入起始位置（行 列）：').split()
                end = input('请输入目标位置（行 列）：').split()
                
                start_row, start_col = int(start[0]), int(start[1])
                end_row, end_col = int(end[0]), int(end[1])
                
                # 移动棋子
                self.board[end_row][end_col] = self.board[start_row][start_col]
                self.board[start_row][start_col] = ' '
                
                # 切换玩家
                self.current_player = '黑' if self.current_player == '红' else '红'
                return True
            except:
                print('输入无效，请重试')
                
    def play(self):
        print('欢迎来到中国象棋！')
        while True:
            self.display_board()
            if not self.make_move():
                break

# 开始游戏
game = ChineseChess()
game.play() 