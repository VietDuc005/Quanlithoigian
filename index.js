 // Global variables
        let timers = {
            stopwatch: { interval: null, time: 0, running: false, totalTime: 0 },
            timer: { interval: null, time: 0, running: false, initialTime: 0 },
            pomodoro: { interval: null, time: 0, running: false, isWork: true, workTime: 25, breakTime: 5, initialTime: 0 }
        };

        let stats = {
            totalStopwatch: 0,
            totalWork: 0,
            totalBreak: 0,
            completedTasks: 0
        };

        // Utility functions
        function formatTime(seconds, showHours = true) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            if (showHours || hrs > 0) {
                return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function updateStats() {
            document.getElementById('total-stopwatch').textContent = Math.floor(stats.totalStopwatch / 60);
            document.getElementById('total-work').textContent = Math.floor(stats.totalWork / 60);
            document.getElementById('total-break').textContent = Math.floor(stats.totalBreak / 60);
            document.getElementById('completed-tasks').textContent = stats.completedTasks;
        }

        function updateProgress(type, current, total) {
            const progressElement = document.getElementById(`${type}-progress`);
            if (progressElement && total > 0) {
                const percentage = ((total - current) / total) * 100;
                progressElement.style.width = `${Math.max(0, percentage)}%`;
            }
        }

        // Stopwatch functionality
        function initStopwatch() {
            const display = document.getElementById('stopwatch-display');
            const startBtn = document.getElementById('start-stopwatch');
            const pauseBtn = document.getElementById('pause-stopwatch');
            const resetBtn = document.getElementById('reset-stopwatch');

            startBtn.addEventListener('click', () => {
                if (!timers.stopwatch.running) {
                    timers.stopwatch.interval = setInterval(() => {
                        timers.stopwatch.time++;
                        display.textContent = formatTime(timers.stopwatch.time);
                        updateProgress('stopwatch', 0, 100); // Continuous progress
                    }, 1000);
                    timers.stopwatch.running = true;
                    startBtn.textContent = '⏸️ Đang chạy';
                    showNotification('Bắt đầu bấm giờ!');
                }
            });

            pauseBtn.addEventListener('click', () => {
                if (timers.stopwatch.running) {
                    clearInterval(timers.stopwatch.interval);
                    timers.stopwatch.running = false;
                    stats.totalStopwatch += timers.stopwatch.time;
                    updateStats();
                    startBtn.textContent = '▶️ Tiếp tục';
                    showNotification('Đã tạm dừng bấm giờ!');
                }
            });

            resetBtn.addEventListener('click', () => {
                clearInterval(timers.stopwatch.interval);
                timers.stopwatch.time = 0;
                timers.stopwatch.running = false;
                display.textContent = '00:00:00';
                startBtn.textContent = '▶️ Bắt Đầu';
                updateProgress('stopwatch', 0, 100);
                showNotification('Đã reset bấm giờ!');
            });
        }

        // Timer functionality
        function initTimer() {
            const display = document.getElementById('timer-display');
            const minutesInput = document.getElementById('timer-minutes');
            const secondsInput = document.getElementById('timer-seconds');
            const startBtn = document.getElementById('start-timer');
            const pauseBtn = document.getElementById('pause-timer');
            const resetBtn = document.getElementById('reset-timer');

            function updateTimerDisplay() {
                const mins = parseInt(minutesInput.value) || 0;
                const secs = parseInt(secondsInput.value) || 0;
                const totalTime = mins * 60 + secs;
                display.textContent = formatTime(totalTime, false);
                updateProgress('timer', 0, totalTime);
            }

            minutesInput.addEventListener('input', updateTimerDisplay);
            secondsInput.addEventListener('input', updateTimerDisplay);

            startBtn.addEventListener('click', () => {
                if (!timers.timer.running) {
                    const mins = parseInt(minutesInput.value) || 0;
                    const secs = parseInt(secondsInput.value) || 0;
                    timers.timer.time = mins * 60 + secs;
                    timers.timer.initialTime = timers.timer.time;

                    if (timers.timer.time > 0) {
                        timers.timer.interval = setInterval(() => {
                            if (timers.timer.time > 0) {
                                timers.timer.time--;
                                display.textContent = formatTime(timers.timer.time, false);
                                updateProgress('timer', timers.timer.time, timers.timer.initialTime);
                            } else {
                                clearInterval(timers.timer.interval);
                                timers.timer.running = false;
                                startBtn.textContent = '▶️ Bắt Đầu';
                                showNotification('⏰ Hẹn giờ đã kết thúc!', 'success');
                                updateProgress('timer', 0, timers.timer.initialTime);
                            }
                        }, 1000);
                        timers.timer.running = true;
                        startBtn.textContent = '⏸️ Đang chạy';
                        showNotification('Bắt đầu hẹn giờ!');
                    } else {
                        showNotification('Vui lòng nhập thời gian hợp lệ!', 'error');
                    }
                }
            });

            pauseBtn.addEventListener('click', () => {
                if (timers.timer.running) {
                    clearInterval(timers.timer.interval);
                    timers.timer.running = false;
                    startBtn.textContent = '▶️ Tiếp tục';
                    showNotification('Đã tạm dừng hẹn giờ!');
                }
            });

            resetBtn.addEventListener('click', () => {
                clearInterval(timers.timer.interval);
                timers.timer.running = false;
                startBtn.textContent = '▶️ Bắt Đầu';
                updateTimerDisplay();
                showNotification('Đã reset hẹn giờ!');
            });
        }

        // Pomodoro functionality
        function initPomodoro() {
            const display = document.getElementById('pomodoro-display');
            const status = document.getElementById('pomodoro-status');
            const workInput = document.getElementById('work-minutes');
            const breakInput = document.getElementById('break-minutes');
            const startBtn = document.getElementById('start-pomodoro');
            const pauseBtn = document.getElementById('pause-pomodoro');
            const resetBtn = document.getElementById('reset-pomodoro');

            function updatePomodoroDisplay() {
                const workMins = parseInt(workInput.value) || 25;
                const breakMins = parseInt(breakInput.value) || 5;
                timers.pomodoro.workTime = workMins;
                timers.pomodoro.breakTime = breakMins;
                
                if (!timers.pomodoro.running) {
                    const currentTime = timers.pomodoro.isWork ? workMins : breakMins;
                    display.textContent = formatTime(currentTime * 60, false);
                    updateProgress('pomodoro', 0, currentTime * 60);
                }
            }

            workInput.addEventListener('input', updatePomodoroDisplay);
            breakInput.addEventListener('input', updatePomodoroDisplay);

            startBtn.addEventListener('click', () => {
                if (!timers.pomodoro.running) {
                    const currentDuration = timers.pomodoro.isWork ? timers.pomodoro.workTime : timers.pomodoro.breakTime;
                    timers.pomodoro.time = currentDuration * 60;
                    timers.pomodoro.initialTime = timers.pomodoro.time;

                    status.textContent = timers.pomodoro.isWork ? '🎯 Đang làm việc' : '☕ Đang nghỉ';
                    status.className = timers.pomodoro.isWork ? 'status working' : 'status break';

                    timers.pomodoro.interval = setInterval(() => {
                        if (timers.pomodoro.time > 0) {
                            timers.pomodoro.time--;
                            display.textContent = formatTime(timers.pomodoro.time, false);
                            updateProgress('pomodoro', timers.pomodoro.time, timers.pomodoro.initialTime);
                        } else {
                            clearInterval(timers.pomodoro.interval);
                            
                            if (timers.pomodoro.isWork) {
                                stats.totalWork += timers.pomodoro.workTime * 60;
                                showNotification('⏰ Hết thời gian làm việc! Bắt đầu nghỉ ngơi.', 'success');
                            } else {
                                stats.totalBreak += timers.pomodoro.breakTime * 60;
                                showNotification('⏰ Hết thời gian nghỉ! Bắt đầu làm việc.', 'success');
                            }
                            
                            updateStats();
                            timers.pomodoro.isWork = !timers.pomodoro.isWork;
                            
                            // Auto-start next session
                            setTimeout(() => {
                                if (confirm(timers.pomodoro.isWork ? 'Bắt đầu làm việc?' : 'Bắt đầu nghỉ ngơi?')) {
                                    startBtn.click();
                                } else {
                                    timers.pomodoro.running = false;
                                    startBtn.textContent = '▶️ Bắt Đầu';
                                    status.textContent = '🍅 Sẵn sàng';
                                    status.className = 'status';
                                }
                            }, 1000);
                        }
                    }, 1000);
                    
                    timers.pomodoro.running = true;
                    startBtn.textContent = '⏸️ Đang chạy';
                }
            });

            pauseBtn.addEventListener('click', () => {
                if (timers.pomodoro.running) {
                    clearInterval(timers.pomodoro.interval);
                    timers.pomodoro.running = false;
                    startBtn.textContent = '▶️ Tiếp tục';
                    status.textContent = '⏸️ Đã tạm dừng';
                    status.className = 'status';
                    showNotification('Đã tạm dừng Pomodoro!');
                }
            });

            resetBtn.addEventListener('click', () => {
                clearInterval(timers.pomodoro.interval);
                timers.pomodoro.running = false;
                timers.pomodoro.isWork = true;
                startBtn.textContent = '▶️ Bắt Đầu';
                status.textContent = '🎯 Sẵn sàng làm việc';
                status.className = 'status';
                updatePomodoroDisplay();
                showNotification('Đã reset Pomodoro!');
            });

            updatePomodoroDisplay();
        }

        // Task management
        function initTasks() {
            const input = document.getElementById('task-input');
            const addBtn = document.getElementById('add-task');
            const taskList = document.getElementById('task-list');
            let taskId = 0;

            function addTask() {
                const taskText = input.value.trim();
                if (taskText) {
                    const li = document.createElement('li');
                    li.className = 'task-item';
                    li.dataset.id = taskId++;
                    
                    const textSpan = document.createElement('div');
                    textSpan.className = 'task-text';
                    textSpan.textContent = taskText;
                    textSpan.contentEditable = true;
                    
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'task-actions';
                    
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit';
                    editBtn.textContent = '✏️';
                    editBtn.title = 'Chỉnh sửa';
                    editBtn.addEventListener('click', () => {
                        if (li.classList.contains('completed')) {
                            showNotification('Không thể sửa công việc đã hoàn thành!', 'error');
                            return;
                        }
                        textSpan.focus();
                        // Select all text
                        const range = document.createRange();
                        range.selectNodeContents(textSpan);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                        showNotification('💡 Đang chỉnh sửa - nhấn Enter để lưu!');
                    });
                    
                    const completeBtn = document.createElement('button');
                    completeBtn.className = 'complete';
                    completeBtn.textContent = '✅';
                    completeBtn.title = 'Hoàn thành';
                    completeBtn.addEventListener('click', () => {
                        if (li.classList.contains('completed')) {
                            // Uncomplete task
                            li.classList.remove('completed');
                            completeBtn.textContent = '✅';
                            completeBtn.title = 'Hoàn thành';
                            stats.completedTasks--;
                            showNotification('🔄 Đã khôi phục công việc!');
                        } else {
                            // Complete task
                            li.classList.add('completed');
                            completeBtn.textContent = '↩️';
                            completeBtn.title = 'Khôi phục';
                            stats.completedTasks++;
                            showNotification('✅ Đã hoàn thành công việc!');
                        }
                        updateStats();
                    });
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete';
                    deleteBtn.textContent = '🗑️';
                    deleteBtn.title = 'Xóa';
                    deleteBtn.addEventListener('click', () => {
                        if (confirm('Bạn có chắc muốn xóa công việc này?')) {
                            li.style.transform = 'translateX(100%)';
                            li.style.opacity = '0';
                            setTimeout(() => {
                                li.remove();
                                showNotification('🗑️ Đã xóa công việc!');
                            }, 300);
                        }
                    });
                    
                    // Save edit on Enter or blur
                    textSpan.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            textSpan.blur();
                        }
                    });
                    
                    textSpan.addEventListener('blur', () => {
                        const newText = textSpan.textContent.trim();
                        if (newText === '') {
                            textSpan.textContent = 'Công việc trống';
                        }
                        showNotification('💾 Đã lưu thay đổi!');
                    });
                    
                    // Prevent line breaks in contentEditable
                    textSpan.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const text = (e.clipboardData || window.clipboardData).getData('text');
                        document.execCommand('insertText', false, text.replace(/\n/g, ' '));
                    });
                    
                    actionsDiv.appendChild(editBtn);
                    actionsDiv.appendChild(completeBtn);
                    actionsDiv.appendChild(deleteBtn);
                    
                    li.appendChild(textSpan);
                    li.appendChild(actionsDiv);
                    taskList.appendChild(li);
                    
                    input.value = '';
                    showNotification('➕ Đã thêm công việc mới!');
                    
                    // Auto scroll to new task
                    li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            addBtn.addEventListener('click', addTask);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
        }

        // Initialize all components
        document.addEventListener('DOMContentLoaded', () => {
            initStopwatch();
            initTimer();
            initPomodoro();
            initTasks();
            updateStats();
            
            showNotification('🎉 Chào mừng đến với Quản Lý Thời Gian Pro!');
        });