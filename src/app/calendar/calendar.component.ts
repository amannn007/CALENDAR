import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { addDays, addMonths, endOfMonth, format, startOfMonth, isSameDay, startOfWeek, endOfWeek, subMonths } from 'date-fns';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  appointmentForm: FormGroup;
  appointments: { title: string; description: string; date: Date }[] = [];
  editIndex: number | null = null;
  days: Date[] = [];
  selectedDate: Date | null = null;
  showForm: boolean = false;
  currentMonth: Date = new Date();

  constructor(private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.generateCalendar(this.currentMonth);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  loadAppointments(): void {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
      this.appointments = JSON.parse(storedAppointments).map((appointment: any) => ({
        ...appointment,
        date: new Date(appointment.date)
      }));
    }
  }

  saveAppointments(): void {
    localStorage.setItem('appointments', JSON.stringify(this.appointments));
  }

  generateCalendar(month: Date): void {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    const daysArray = [];

    for (let day = start; day <= end; day = addDays(day, 1)) {
      daysArray.push(day);
    }

    this.days = daysArray;
  }

  prevMonth(): void {
    this.currentMonth = subMonths(this.currentMonth, 1);
    this.generateCalendar(this.currentMonth);
  }

  nextMonth(): void {
    this.currentMonth = addMonths(this.currentMonth, 1);
    this.generateCalendar(this.currentMonth);
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const updatedAppointment = {
        ...formValue,
        date: new Date(formValue.date)
      };

      if (this.editIndex !== null) {
        this.appointments[this.editIndex] = updatedAppointment;
        this.editIndex = null;
      } else {
        this.appointments.push(updatedAppointment);
      }

      this.saveAppointments();
      this.appointmentForm.reset({ date: new Date() });
      this.generateCalendar(this.currentMonth);
      this.toggleForm();
    }
  }

  onEdit(index: number): void {
    this.editIndex = index;
    const appointment = this.appointments[index];
    this.appointmentForm.patchValue({
      ...appointment,
      date: new Date(appointment.date)
    });
    this.showForm = true;
  }

  onDelete(index: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointments.splice(index, 1);
      this.saveAppointments();
      this.generateCalendar(this.currentMonth);
    }
  }

  onDragDrop(event: CdkDragDrop<{ title: string; description: string; date: Date }[]>): void {
    moveItemInArray(this.appointments, event.previousIndex, event.currentIndex);
    this.saveAppointments();
  }

  getAppointmentsForDate(date: Date): { title: string; description: string; date: Date }[] {
    return this.appointments.filter(appointment => 
      isSameDay(appointment.date, date)
    );
  }
}
