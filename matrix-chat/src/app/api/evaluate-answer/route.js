export async function POST(request) {
    const { question, answer } = await request.json();

    try {
        const res = await fetch('http://localhost:8000/evaluate_answer', {  // Replace with your FastAPI backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, answer }),
        });

        if (!res.ok) {
            return new Response('Failed to evaluate answer', { status: res.status });
        }

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        return new Response('Internal server error', { status: 500 });
    }
}
