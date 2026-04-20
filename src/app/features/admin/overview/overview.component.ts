import { Component, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { MessageService } from 'primeng/api';

interface RecentReservation {
  id: number;
  user: string;
  space: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

@Component({
  standalone: true,
  selector: 'app-admin-overview',
  imports: [CurrencyPipe, DatePipe, NgClass, RouterLink, TableComponent, ColumnComponent],
  templateUrl: './overview.component.html',
  providers:[MessageService]
})
export class AdminOverviewComponent {
  readonly stats = signal({
    totalUsers: 142,
    totalRevenue: 28450,
    activeReservations: 23,
    availableSpaces: 18,
  });

  readonly recentReservations = signal<RecentReservation[]>([
    { id: 1, user: 'Alice Martin',  space: 'Open Space A',     date: '2024-04-10', status: 'confirmed', amount: 240 },
    { id: 2, user: 'Bob Johnson',   space: 'Meeting Room 1',   date: '2024-04-12', status: 'pending',   amount: 120 },
    { id: 3, user: 'Carol White',   space: 'Private Office 3', date: '2024-04-13', status: 'confirmed', amount: 560 },
    { id: 4, user: 'David Brown',   space: 'Hot Desk B',       date: '2024-04-14', status: 'cancelled', amount: 80  },
    { id: 5, user: 'Eva Green',     space: 'Conference Hall',  date: '2024-04-15', status: 'pending',   amount: 350 },
  ]);

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'bg-[#CEF09D] text-zinc-800',
      pending:   'bg-[#FDD5AB] text-zinc-800',
      cancelled: 'bg-zinc-100 text-zinc-500',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }
}
