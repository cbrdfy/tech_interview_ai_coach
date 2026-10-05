export async function POST(request) {
    const { topic } = await request.json();

    try {
        const res = await fetch('http://localhost:8000/generate_question', {  // Replace with your FastAPI backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic }),
        });

        if (!res.ok) {
            return new Response('Failed to generate question', { status: res.status });
        }

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        return new Response('Internal server error', { status: 500 });
    }
}
