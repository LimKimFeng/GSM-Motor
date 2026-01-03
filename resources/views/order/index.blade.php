<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Riwayat Pesanan') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    @if($orders->isEmpty())
                        <div class="text-center py-10">
                            <p class="text-gray-500 text-lg">Belum ada riwayat pesanan.</p>
                        </div>
                    @else
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left text-gray-500">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">No. Order</th>
                                        <th scope="col" class="px-6 py-3">Tanggal</th>
                                        <th scope="col" class="px-6 py-3">Status</th>
                                        <th scope="col" class="px-6 py-3">Total</th>
                                        <th scope="col" class="px-6 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($orders as $order)
                                        <tr class="bg-white border-b hover:bg-gray-50">
                                            <td class="px-6 py-4 font-bold text-gray-900">{{ $order->order_number }}</td>
                                            <td class="px-6 py-4">{{ $order->created_at->format('d M Y H:i') }}</td>
                                            <td class="px-6 py-4">
                                                <span class="px-2 py-1 font-semibold leading-tight rounded-full 
                                                    {{ $order->status === 'completed' ? 'text-green-700 bg-green-100' : 
                                                       ($order->status === 'cancelled' ? 'text-red-700 bg-red-100' : 'text-yellow-700 bg-yellow-100') }}">
                                                    {{ ucfirst($order->status) }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4">Rp {{ number_format($order->total_price, 0, ',', '.') }}</td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('order.show', $order->id) }}" class="font-medium text-orange-600 hover:underline">Detail</a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif

                </div>
            </div>
        </div>
    </div>
</x-app-layout>
